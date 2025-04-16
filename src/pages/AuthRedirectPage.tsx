
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User, Building } from 'lucide-react';

const AuthRedirectPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'URL est exactement /login, rediriger vers /auth qui est notre page d'authentification standard
    if (window.location.pathname === '/login') {
      // Pas de redirection automatique, nous laissons l'utilisateur choisir
      console.log('Page de redirection chargée.');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Choisissez votre type de connexion</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-[#0D6A51]/10 text-[#0D6A51] rounded-full flex items-center justify-center mb-4">
                <User className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">Utilisateur Standard</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Accès à votre compte personnel
              </p>
              <Button 
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90" 
                onClick={() => navigate('/auth')}
              >
                Espace Client
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">Admin SFD</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Accès administrateur pour les SFDs
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => navigate('/sfd/auth')}
              >
                Connexion SFD
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">Admin MEREF</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Accès administrateur central
              </p>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700" 
                onClick={() => navigate('/admin/auth')}
              >
                Administration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground text-center">
        Veuillez choisir le type d'accès correspondant à votre profil.<br />
        En cas de problème d'accès, contactez l'administrateur système.
      </p>
    </div>
  );
};

export default AuthRedirectPage;
