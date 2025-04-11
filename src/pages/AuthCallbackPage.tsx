
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          console.error('Auth callback error:', error);
          return;
        }
        
        // Redirect based on user role once authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userRoleData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          const userRole = userRoleData?.role || 'client';
          
          if (userRole === 'admin' || userRole === 'super_admin') {
            navigate('/admin-dashboard');
          } else if (userRole === 'sfd_admin') {
            navigate('/dashboard');
          } else {
            navigate('/profile');
          }
        } else {
          navigate('/auth');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError('Une erreur est survenue lors de l\'authentification');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="p-8 bg-white rounded shadow-md max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Erreur d'authentification</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded shadow-md max-w-md w-full text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
        <h1 className="text-xl font-bold mb-2">Authentification en cours...</h1>
        <p className="text-gray-600">Vous allez être redirigé automatiquement.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
