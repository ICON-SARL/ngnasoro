
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';
import { SfdLoginForm } from '@/components/sfd/auth/SfdLoginForm';
import { Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

const SfdAuthUI = () => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Function to check if the user is an SFD admin
  const checkSfdAdminStatus = async (userId: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      // Check for sfd_admin role in user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'sfd_admin')
        .maybeSingle();
      
      if (error) {
        console.error("Error checking SFD admin status:", error);
        return false;
      }
      
      return !!data; // Return true if data exists, false otherwise
    } catch (err) {
      console.error("Error in checkSfdAdminStatus:", err);
      return false;
    }
  };
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        navigate('/agency-dashboard');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (user && !loading) {
        console.log("SfdAuthUI - User detected:", user);
        
        // Check if user is an SFD admin, either from metadata or from database
        const isSfdAdmin = user.app_metadata?.role === 'sfd_admin' || await checkSfdAdminStatus(user.id);
        
        if (isSfdAdmin) {
          // ✅ SECURE: No localStorage/sessionStorage for roles - role checked server-side
          navigate('/agency-dashboard');
        } else {
          // If not an SFD admin, show error
          const currentRole = user.app_metadata?.role || 'utilisateur standard';
          setAuthError(`Accès refusé. Vous n'avez pas le rôle d'administrateur SFD (rôle actuel: ${currentRole}).`);
        }
      }
    };
    
    checkAndRedirect();
  }, [user, loading, navigate]);

  if (authSuccess) {
    return (
      <div className="auth-container bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="max-w-md w-full auth-card p-8 text-center">
          <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-blue-700 mb-3">Connexion réussie!</h1>
          <p className="mt-2 text-gray-600 text-lg">Vous allez être redirigé vers le tableau de bord SFD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="auth-card">
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h2 className="text-blue-800 font-medium text-center">
              Connexion Administration SFD
            </h2>
          </div>
          
          {authError && (
            <div className="p-4 bg-red-50 text-red-800 text-sm">
              <p>{authError}</p>
            </div>
          )}
          
          <SfdLoginForm />
          
          <div className="mt-4 text-center pb-6 flex flex-col gap-2">
            <Link 
              to="/auth"
              className="text-blue-600 hover:underline font-medium"
            >
              Changer de type de connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SfdAuthUI;
