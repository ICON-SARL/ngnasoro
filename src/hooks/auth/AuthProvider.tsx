
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { User } from './types';
import { createUserFromSupabaseUser, isUserAdmin, getBiometricStatus } from './authUtils';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TwoFactorAuth } from '@/components/auth/TwoFactorAuth';
import { AuditLogCategory, AuditLogSeverity, logAuditEvent } from '@/utils/auditLogger';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set session first to avoid race conditions
        setSession(session);

        if (session?.user) {
          // Check if user has admin role
          setIsAdmin(isUserAdmin(session));
          setBiometricEnabled(getBiometricStatus(session));
          setUser(createUserFromSupabaseUser(session.user));

          // Set active SFD ID if available
          if (session.user.user_metadata.sfd_id) {
            setActiveSfdId(session.user.user_metadata.sfd_id as string);
          }

          // Check if user is admin and if 2FA is required
          if (isAdmin && !isTwoFactorVerified) {
            // Check if admin has 2FA enabled
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('has_2fa')
              .eq('id', session.user.id)
              .single();

            if (adminData?.has_2fa) {
              // Fetch admin's 2FA secret
              const { data: twoFactorData } = await supabase
                .from('user_2fa')
                .select('secret_key')
                .eq('user_id', session.user.id)
                .single();

              if (twoFactorData?.secret_key) {
                setTwoFactorSecret(twoFactorData.secret_key);
                setShowTwoFactorDialog(true);
              }
            }
          }
        } else {
          setUser(null);
          setActiveSfdId(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session?.user) {
        setIsAdmin(isUserAdmin(session));
        setBiometricEnabled(getBiometricStatus(session));
        setUser(createUserFromSupabaseUser(session.user));

        // Set active SFD ID if available
        if (session.user.user_metadata.sfd_id) {
          setActiveSfdId(session.user.user_metadata.sfd_id as string);
        }
      } else {
        setUser(null);
        setActiveSfdId(null);
        setIsTwoFactorVerified(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isTwoFactorVerified]);

  const signIn = async (email: string, password: string, useOtp: boolean = false) => {
    try {
      if (useOtp) {
        const { error } = await supabase.auth.signInWithOtp({ 
          email,
          options: {
            // This ensures we always get a fresh email
            emailRedirectTo: window.location.origin + '/auth'
          }
        });
        if (error) throw error;
        return;
      }
      
      // Use password authentication by default
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      // Log successful login
      await logAuditEvent({
        user_id: data.user?.id,
        action: 'user_login',
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.INFO,
        status: 'success'
      });
      
      // Check if this user is an admin and requires 2FA
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('has_2fa')
        .eq('id', data.user?.id)
        .single();

      if (adminData?.has_2fa) {
        // Fetch admin's 2FA secret
        const { data: twoFactorData } = await supabase
          .from('user_2fa')
          .select('secret_key')
          .eq('user_id', data.user?.id)
          .single();

        if (twoFactorData?.secret_key) {
          setTwoFactorSecret(twoFactorData.secret_key);
          setShowTwoFactorDialog(true);
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error.message);
      
      // Log failed login attempt
      await logAuditEvent({
        action: 'user_login_failed',
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.WARNING,
        details: { email },
        status: 'failure',
        error_message: error.message
      });
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin + '/auth'
        },
      });
      
      if (error) throw error;
      
      // Log signup
      await logAuditEvent({
        user_id: data.user?.id,
        action: 'user_signup',
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.INFO,
        status: 'success'
      });
      
      toast({
        title: 'Compte créé',
        description: 'Veuillez vérifier votre e-mail pour confirmer votre compte.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.error_description || error.message,
        variant: 'destructive'
      });
      
      // Log failed signup
      await logAuditEvent({
        action: 'user_signup_failed',
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.WARNING,
        details: { email },
        status: 'failure',
        error_message: error.message
      });
    }
  };

  const signOut = async () => {
    try {
      // Log the user out action before actually signing out
      if (user) {
        await logAuditEvent({
          user_id: user.id,
          action: 'user_logout',
          category: AuditLogCategory.AUTHENTICATION,
          severity: AuditLogSeverity.INFO,
          status: 'success'
        });
      }
      
      await supabase.auth.signOut();
      setIsTwoFactorVerified(false);
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  const verifyBiometricAuth = async (): Promise<boolean> => {
    try {
      // In a real implementation, this would integrate with device biometrics
      // For this demo, we're simulating successful verification
      console.log("Biometric authentication verified");
      return true;
    } catch (error) {
      console.error("Biometric verification failed:", error);
      return false;
    }
  };

  const toggleBiometricAuth = async (enabled: boolean): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { biometric_enabled: enabled }
      });

      if (error) throw error;
      
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error("Failed to toggle biometric authentication:", error);
      throw error;
    }
  };
  
  const handleTwoFactorComplete = (success: boolean) => {
    setShowTwoFactorDialog(false);
    
    if (success) {
      setIsTwoFactorVerified(true);
      toast({
        title: 'Vérification réussie',
        description: 'Authentification à deux facteurs validée',
      });
    } else {
      // If 2FA verification fails, sign the user out
      signOut();
      toast({
        title: 'Vérification échouée',
        description: 'La vérification a échoué. Veuillez réessayer.',
        variant: 'destructive'
      });
    }
  };

  const value = {
    session,
    user,
    signIn,
    signOut,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    activeSfdId,
    setActiveSfdId,
    isAdmin,
    signUp,
    verifyBiometricAuth,
    biometricEnabled,
    toggleBiometricAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* 2FA Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={(open) => {
        // Only allow closing if 2FA is verified or we're not signed in
        if (!open && (!session || isTwoFactorVerified)) {
          setShowTwoFactorDialog(false);
        } else if (!open && session && !isTwoFactorVerified) {
          // If trying to close without verification, show a message and sign out
          toast({
            title: 'Vérification requise',
            description: 'L\'authentification à deux facteurs est requise pour les administrateurs',
            variant: 'destructive'
          });
          signOut();
        }
      }}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Authentification à deux facteurs</DialogTitle>
            <DialogDescription>
              Veuillez compléter l'authentification à deux facteurs pour continuer
            </DialogDescription>
          </DialogHeader>
          
          {session?.user && twoFactorSecret && (
            <TwoFactorAuth 
              userId={session.user.id}
              onComplete={handleTwoFactorComplete}
              mode="verify"
            />
          )}
        </DialogContent>
      </Dialog>
      
      {(!isLoading && (!isAdmin || isAdmin && (isTwoFactorVerified || !showTwoFactorDialog))) && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
