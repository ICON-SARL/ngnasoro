
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TestAuth = () => {
  const { user, userRole, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Log auth information for debugging
    console.log("Auth test component - user:", user);
    console.log("Auth test component - user role:", userRole);
    console.log("Auth test component - app_metadata:", user?.app_metadata);
  }, [user, userRole]);
  
  const testAccounts = [
    { email: "client@test.com", password: "password123", role: "client" },
    { email: "sfd@test.com", password: "password123", role: "sfd_admin" },
    { email: "admin@test.com", password: "password123", role: "admin" },
    { email: "sfd2@test.com", password: "password123", role: "sfd_admin" }
  ];
  
  const handleSignOut = async () => {
    try {
      await signOut();
      setMessage("Déconnexion réussie");
    } catch (error) {
      setMessage("Erreur lors de la déconnexion");
      console.error(error);
    }
  };
  
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Test d'authentification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant="info" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {user ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Utilisateur connecté :</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rôle:</strong> {user.app_metadata?.role || 'Non défini'}</p>
              <p><strong>Nom:</strong> {user.user_metadata?.full_name || 'Non défini'}</p>
            </div>
            
            <Button 
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              Se déconnecter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun utilisateur connecté. Utilisez les identifiants de test ci-dessous.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h3 className="font-medium">Comptes de test disponibles :</h3>
              <div className="border rounded-lg">
                {testAccounts.map((account, index) => (
                  <div 
                    key={account.email} 
                    className={`p-3 ${index !== testAccounts.length - 1 ? 'border-b' : ''}`}
                  >
                    <p><strong>Email:</strong> {account.email}</p>
                    <p><strong>Mot de passe:</strong> {account.password}</p>
                    <p><strong>Rôle:</strong> {account.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestAuth;
