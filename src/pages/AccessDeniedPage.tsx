
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/hooks/auth/types';

const AccessDeniedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin, isSfdAdmin, isClient, userRole } = useAuth();
  
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

  // Afficher le rôle de manière lisible
  const getDisplayRole = (role: string | null) => {
    if (!role) return 'Non défini';
    return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
  };

  // Déterminer si l'utilisateur est un simple utilisateur tentant d'accéder à une zone client
  const isUserTryingClientAccess = userRole === 'user' && 
    (requiredRole === UserRole.Client || requiredRole === 'client');
  
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
                <strong>Rôle requis :</strong> {getDisplayRole(requiredRole)}
              </p>
            )}
            {user && (
              <p>
                <strong>Votre rôle :</strong> {getDisplayRole(userRole)}
              </p>
            )}
          </div>
        </div>
        
        {isUserTryingClientAccess && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-amber-800">
            <h3 className="font-semibold mb-2">Devenir client</h3>
            <p className="text-sm">
              Vous êtes actuellement un simple utilisateur. Pour accéder à cette section, vous devez d'abord 
              devenir client en soumettant une demande d'adhésion à une SFD.
            </p>
            <Link to="/mobile-flow/sfd-selector">
              <Button className="w-full mt-3 bg-amber-600 hover:bg-amber-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Adhérer à une SFD
              </Button>
            </Link>
          </div>
        )}
        
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
