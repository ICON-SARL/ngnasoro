
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Info, UserX, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole, PERMISSIONS, ROLE_DESCRIPTIONS } from '@/utils/auth/roles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

const AccessDeniedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Retrieve information about why access was denied from location state
  const { requiredRole, requiredPermission, from } = location.state || {};
  
  // Generate helpful messages based on what was denied
  const getRoleText = (): string => {
    if (!requiredRole) return '';
    
    const roleList = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const roleNames = roleList.map(role => 
      ROLE_DESCRIPTIONS[role as UserRole] || String(role)
    ).join(' ou ');
    
    return `Rôle requis: ${roleNames}`;
  };
  
  const getPermissionText = (): string => {
    if (!requiredPermission) return '';
    
    const permList = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    return `Permission${permList.length > 1 ? 's' : ''} requise${permList.length > 1 ? 's' : ''}: ${permList.join(', ')}`;
  };

  const goBack = () => {
    // Navigate back if possible, or go to home page
    if (from) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  
  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 shadow-lg">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <ShieldX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-red-700">Accès Refusé</CardTitle>
              <CardDescription className="text-red-600">
                Vous n'avez pas les autorisations nécessaires
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Pourquoi cet accès est restreint</AlertTitle>
            <AlertDescription className="mt-2">
              {getRoleText() && (
                <div className="flex items-start mb-2">
                  <UserX className="h-4 w-4 mr-2 mt-0.5" />
                  <p>{getRoleText()}</p>
                </div>
              )}
              
              {getPermissionText() && (
                <div className="flex items-start">
                  <KeyRound className="h-4 w-4 mr-2 mt-0.5" />
                  <p>{getPermissionText()}</p>
                </div>
              )}
              
              {!getRoleText() && !getPermissionText() && (
                <p>Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button onClick={goBack} variant="outline" className="flex-1 gap-1">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            
            {!user && (
              <Button onClick={goToLogin} className="flex-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90">
                Se Connecter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDeniedPage;
