
import React, { useEffect } from 'react';
import { Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccountsSection from './sfd-accounts/AccountsSection';
import { useSfdSwitch } from '@/hooks/useSfdSwitch';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { useToast } from '@/hooks/use-toast';
import ErrorState from '../sfd-savings/ErrorState';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SfdAccountsSectionProps {
  sfdData?: any[];
  activeSfdId?: string | null;
  onSwitchSfd?: (sfdId: string) => Promise<boolean> | void;
}

const SfdAccountsSection: React.FC<SfdAccountsSectionProps> = (props) => {
  const { 
    verificationRequired, 
    pendingSfdId, 
    isVerifying,
    cancelSwitch,
    completeSwitch 
  } = useSfdSwitch();
  
  const { toast } = useToast();
  const { sfdAccounts, refetch, synchronizeBalances } = useSfdAccounts();
  const { synchronizeWithSfd, isSyncing, syncError, retryCount } = useRealtimeSynchronization();
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  
  useEffect(() => {
    let isMounted = true;
    
    const syncOnMount = async () => {
      try {
        const syncResult = await synchronizeWithSfd();
        if (syncResult && isMounted) {
          await refetch();
        }
      } catch (error) {
        console.error("Failed to synchronize accounts on mount:", error);
      }
    };
    
    syncOnMount();
    
    return () => {
      isMounted = false;
    };
  }, [synchronizeWithSfd, refetch]);

  // Enhanced logic to ensure client accounts are properly linked
  useEffect(() => {
    const ensureClientAccountsLinked = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch client accounts from sfd_clients table
        const { data: clientAccounts, error: clientError } = await supabase
          .from('sfd_clients')
          .select('id, sfd_id, user_id, status')
          .eq('user_id', user.id)
          .eq('status', 'validated'); // Only get validated clients
        
        if (clientError) throw clientError;
        
        console.log('Found client accounts:', clientAccounts);
        
        // If user is a validated client in any SFD
        if (clientAccounts && clientAccounts.length > 0) {
          console.log('User is a validated client in SFDs:', clientAccounts.map(ca => ca.sfd_id));
          
          // Process each client account
          for (const account of clientAccounts) {
            // Check if user-sfd association exists
            const { data: existing } = await supabase
              .from('user_sfds')
              .select('id, is_default')
              .eq('user_id', user.id)
              .eq('sfd_id', account.sfd_id)
              .maybeSingle();
              
            // If no association exists, create it
            if (!existing) {
              console.log('Creating user_sfds association for sfd:', account.sfd_id);
              
              await supabase
                .from('user_sfds')
                .insert({
                  user_id: user.id,
                  sfd_id: account.sfd_id,
                  is_default: true // Make default
                });
            }
            
            // Ensure actual account record exists in accounts table
            const { data: existingAccount } = await supabase
              .from('accounts')
              .select('id, balance')
              .eq('user_id', user.id)
              .eq('sfd_id', account.sfd_id)
              .maybeSingle();
              
            if (!existingAccount) {
              console.log('Creating account record for user:', user.id, 'in SFD:', account.sfd_id);
              
              // Create account with initial balance
              await supabase
                .from('accounts')
                .insert({
                  user_id: user.id,
                  sfd_id: account.sfd_id,
                  balance: 0,
                  currency: 'FCFA'
                });
                
              // Force synchronize with the edge function to ensure consistent data
              try {
                const { data: syncResult, error: syncError } = await supabase.functions.invoke('synchronize-sfd-accounts', {
                  body: { userId: user.id, sfdId: account.sfd_id, forceFullSync: true }
                });
                
                if (syncError) throw syncError;
                console.log('Account synchronized:', syncResult);
              } catch (err) {
                console.error('Synchronization error:', err);
              }
            }
          }
          
          // Refetch data after ensuring accounts exist
          await refetch();
        }
      } catch (err) {
        console.error("Error ensuring client accounts are linked:", err);
      }
    };
    
    ensureClientAccountsLinked();
  }, [user?.id, refetch]);

  const handleRetrySync = () => {
    synchronizeWithSfd()
      .then(success => {
        if (success) {
          refetch();
        }
      })
      .catch(error => {
        console.error("Error retrying sync:", error);
      });
  };

  if (syncError) {
    return (
      <ErrorState 
        message={syncError}
        retryFn={handleRetrySync}
        retryCount={retryCount}
      />
    );
  }
  
  const showEmptyState = !sfdAccounts || sfdAccounts.length === 0;

  return (
    <>
      <div className="space-y-4 mt-4">
        {showEmptyState ? (
          <div className="text-center p-6 border rounded-lg">
            <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
            <p className="text-sm text-gray-500 mb-4">
              Seul un administrateur SFD peut vous ajouter à un compte.
            </p>
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => {
                toast({
                  title: "Demande de compte SFD",
                  description: "Contactez votre SFD pour l'ajout de votre compte."
                });
              }}
            >
              Contacter un SFD
            </Button>
          </div>
        ) : (
          <AccountsSection 
            {...props} 
            sfdData={sfdAccounts}
            isSyncing={isSyncing}
            onRefresh={synchronizeWithSfd}
          />
        )}
      </div>
    </>
  );
};

export default SfdAccountsSection;
