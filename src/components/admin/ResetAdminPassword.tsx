import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Key, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ResetAdminPassword() {
  const [isResetting, setIsResetting] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ email: string; password: string } | null>(null);
  const { toast } = useToast();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-admin-password');
      
      if (error) throw error;
      
      if (data.success) {
        setNewCredentials(data.credentials);
        toast({
          title: "Mot de passe réinitialisé",
          description: "Le mot de passe admin a été réinitialisé avec succès.",
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le mot de passe.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Réinitialiser Mot de Passe Admin
        </CardTitle>
        <CardDescription>
          Réinitialiser le mot de passe du compte MEREF admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!newCredentials ? (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cette action réinitialisera le mot de passe du compte admin@meref.gov.ml
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleReset} 
              disabled={isResetting}
              className="w-full"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
          </>
        ) : (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="space-y-2">
              <p className="font-semibold text-green-900">Nouveaux identifiants :</p>
              <div className="bg-white p-4 rounded border border-green-300 space-y-2">
                <p className="font-mono text-sm">
                  <strong>Email:</strong> {newCredentials.email}
                </p>
                <p className="font-mono text-sm">
                  <strong>Mot de passe:</strong> {newCredentials.password}
                </p>
              </div>
              <p className="text-xs text-green-700 mt-2">
                ⚠️ Copiez ces identifiants maintenant, ils ne seront plus affichés.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
