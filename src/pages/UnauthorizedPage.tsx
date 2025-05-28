
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Home, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { handleRobustSignOut } from '@/utils/auth/authCleanup';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isSfdAdmin, isClient, userRole } = useAuth();
  const { toast } = useToast();
  
  const from = location.state?.from || '/';
  const requiredRole = location.state?.requiredRole;
  const userId = location.state?.userId;

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
      navigate('/auth', { replace: true });
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
    console.log('Redirecting to dashboard based on role:', userRole);
    
    if (isAdmin) {
      navigate('/super-admin-dashboard', { replace: true });
    } else if (isSfdAdmin) {
      navigate('/agency-dashboard', { replace: true });
    } else if (isClient) {
      navigate('/mobile-flow/main', { replace: true });
    } else {
      // Utilisateur normal - rediriger vers l'interface mobile
      navigate('/mobile-flow/main', { replace: true });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getRoleDisplay = () => {
    if (isAdmin) return 'Administrateur';
    if (isSfdAdmin) return 'Administrateur SFD';
    if (isClient) return 'Client';
    return userRole || 'Non défini';
  };

  const getRequiredRoleDisplay = () => {
    switch(requiredRole) {
      case 'admin': return 'Administrateur';
      case 'sfd_admin': return 'Administrateur SFD';
      case 'client': return 'Client';
      default: return requiredRole || 'Non spécifié';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md mx-auto bg-white rounded-lg shadow-lg">
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
            <p><strong>Votre rôle:</strong> {getRoleDisplay()}</p>
            {requiredRole && (
              <p><strong>Rôle requis:</strong> {getRequiredRoleDisplay()}</p>
            )}
            {from && (
              <p><strong>Page demandée:</strong> {from}</p>
            )}
          </div>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={handleGoToDashboard}
            className="w-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Aller au tableau de bord approprié
          </Button>
          
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser la page
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
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
        
        {/* Debug info en mode développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-left">
            <p><strong>Debug Info:</strong></p>
            <p>User ID: {userId}</p>
            <p>Current Role: {userRole}</p>
            <p>Required Role: {requiredRole}</p>
            <p>From Path: {from}</p>
            <p>Is Admin: {isAdmin.toString()}</p>
            <p>Is SFD Admin: {isSfdAdmin.toString()}</p>
            <p>Is Client: {isClient.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;
