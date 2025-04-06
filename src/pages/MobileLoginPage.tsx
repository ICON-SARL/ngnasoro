
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { assignDefaultSfd, createSfdClient } from '@/hooks/auth/authUtils';
import DemoAccountsCreator from '@/components/auth/DemoAccountsCreator';
import { Loader2, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MobileLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        // Inscription
        const { error } = await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'user'
            }
          }
        });
        
        if (error) throw error;
        
        // Attribuer la SFD Test au nouvel utilisateur
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await assignDefaultSfd(userData.user.id);
          
          // Créer un client SFD en attente de validation
          await createSfdClient(
            "Insérer l'ID de la SFD Test ici",
            fullName,
            email,
            phone,
            userData.user.id
          );
        }
        
        toast({
          title: "Compte créé",
          description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        });
        setIsSignUp(false);
      } else {
        // Connexion
        const { error } = await signIn({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        navigate('/mobile-flow/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-[#0D6A51] flex items-center justify-center">
              <LogIn className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Créer un compte client" : "Connexion Client"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? "Inscrivez-vous pour accéder à votre compte client" : "Connectez-vous pour accéder à votre compte client"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  placeholder="Amadou Diallo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  placeholder="+223 70 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Mot de passe</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Création en cours..." : "Connexion en cours..."}
                </>
              ) : (
                isSignUp ? "Créer un compte" : "Se connecter"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <div className="text-center text-sm">
            {isSignUp ? (
              <span>
                Vous avez déjà un compte ?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(false)}>
                  Se connecter
                </Button>
              </span>
            ) : (
              <span>
                Vous n'avez pas de compte ?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(true)}>
                  Créer un compte
                </Button>
              </span>
            )}
          </div>
          
          <DemoAccountsCreator />
        </CardFooter>
      </Card>
    </div>
  );
};

export default MobileLoginPage;
