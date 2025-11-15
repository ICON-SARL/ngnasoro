import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/auth/LoginForm';
import { ResetAdminPassword } from '@/components/admin/ResetAdminPassword';
import { useAuth } from '@/hooks/useAuth';

const AuthPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/mobile-flow/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      {showReset ? (
        <div className="w-full max-w-md space-y-4">
          <ResetAdminPassword />
          <Button 
            variant="ghost" 
            onClick={() => setShowReset(false)}
            className="w-full"
          >
            Retour à la connexion
          </Button>
        </div>
      ) : (
        <>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Connexion
              </CardTitle>
              <CardDescription>
                Connectez-vous à votre compte MEREF-SFD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
          <div className="w-full max-w-md mt-4">
            <Button 
              variant="link" 
              onClick={() => setShowReset(true)}
              className="w-full text-sm text-muted-foreground"
            >
              Réinitialiser le mot de passe admin MEREF
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthPage;