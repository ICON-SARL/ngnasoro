
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateCaurieSfdButton } from '@/components/sfd/CreateCaurieSfdButton';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const CreateSfdAdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Redirect non-admin users
  React.useEffect(() => {
    if (user && !isAdmin) {
      navigate('/access-denied');
    }
  }, [user, isAdmin, navigate]);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Configuration des accès SFD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-amber-50">
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-amber-600" />
                Créer un accès Admin CAURIE-MF
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <CreateCaurieSfdButton />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-700">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-800">
                <p>Cette fonctionnalité permet de configurer rapidement un compte administrateur pour CAURIE-MF à des fins de test.</p>
                
                <h3 className="font-medium mt-4 mb-2">Comment utiliser:</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Cliquez sur le bouton pour créer l'accès</li>
                  <li>Une fois créé, notez les informations d'accès</li>
                  <li>Utilisez-les pour vous connecter sur la page d'authentification SFD</li>
                  <li>Vous aurez accès à toutes les fonctionnalités administratives</li>
                </ol>
                
                <p className="mt-4 text-blue-700 font-medium">Environnement de test uniquement</p>
                <p className="mt-1">Les identifiants générés sont destinés aux tests et non à la production.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CreateSfdAdminPage;
