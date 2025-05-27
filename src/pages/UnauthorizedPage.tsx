
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { handleRobustSignOut } from '@/utils/auth/authCleanup';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const from = location.state?.from || '/';

  const handleLogout = async () => {
    try {
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      await handleRobustSignOut(supabase);
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      // Redirect to appropriate auth page
      navigate('/sfd/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  const handleGoToDashboard = () => {
    const role = user?.app_metadata?.role;
    
    if (role === 'admin') {
      navigate('/super-admin-dashboard', { replace: true });
    } else if (role === 'sfd_admin') {
      navigate('/agency-dashboard', { replace: true });
    } else {
      navigate('/mobile-flow/main', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md mx-auto">
        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Accès non autorisé
        </h1>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        
        {user && (
          <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-100 rounded">
            <p><strong>Utilisateur:</strong> {user.email}</p>
            <p><strong>Rôle:</strong> {user.app_metadata?.role || 'Non défini'}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={handleGoToDashboard}
            className="w-full"
          >
            Aller au tableau de bord approprié
          </Button>
          
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            Retour
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
