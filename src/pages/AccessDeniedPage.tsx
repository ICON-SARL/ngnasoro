
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth';

const AccessDeniedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const state = location.state as {
    from?: Location;
    requiredPermission?: string;
    requiredRole?: string;
  } | null;
  
  const goBack = () => {
    navigate(-1);
  };
  
  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-red-50">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Accès refusé</CardTitle>
          <CardDescription className="text-center">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Permissions requises</h3>
                <p className="text-sm text-amber-700 mt-1">
                  {state?.requiredPermission && (
                    <>Permission requise: <code className="bg-white px-1 py-0.5 rounded">{state.requiredPermission}</code></>
                  )}
                  {state?.requiredRole && (
                    <>Rôle requis: <code className="bg-white px-1 py-0.5 rounded">{state.requiredRole}</code></>
                  )}
                  {!state?.requiredPermission && !state?.requiredRole && (
                    "Vous n'avez pas les droits d'accès nécessaires."
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur.</p>
            <p className="mt-1">
              Utilisateur: {user?.email || 'Non connecté'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button onClick={goHome}>
            Aller à l'accueil
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccessDeniedPage;
