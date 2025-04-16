
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const AccessDeniedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin, isSfdAdmin, isClient } = useAuth();
  
  const state = location.state as { 
    from: string;
    requiredRole?: string;
    requiredPermission?: string;
  } | null;
  
  const fromPath = state?.from || '/';
  const requiredRole = state?.requiredRole || 'unknown';
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const getDashboardLink = () => {
    if (isAdmin) return '/super-admin-dashboard';
    if (isSfdAdmin) return '/agency-dashboard';
    return '/mobile-flow/main';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600">Accès Refusé</h1>
          <p className="text-center text-gray-600 mt-2">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette ressource.
          </p>
        </div>
        
        <div className="border-t border-b border-gray-200 py-4 my-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Ressource demandée :</strong> {String(fromPath)}
            </p>
            {requiredRole && (
              <p className="mb-2">
                <strong>Rôle requis :</strong> {requiredRole}
              </p>
            )}
            {user && (
              <p>
                <strong>Votre rôle :</strong> {user.app_metadata?.role || 'Non défini'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la page précédente
          </Button>
          
          <Link to={getDashboardLink()}>
            <Button className="w-full">
              Aller au tableau de bord
            </Button>
          </Link>
          
          <Button variant="ghost" onClick={handleSignOut} className="w-full">
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
