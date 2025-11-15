import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminCredential {
  role: string;
  email: string;
  password: string;
  id: string;
  sfd?: string;
}

export function AdminSystemSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<AdminCredential[]>([]);

  const handleSetup = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('setup-admin-system', {
        body: {}
      });

      if (functionError) throw functionError;

      if (data.success) {
        setSuccess(true);
        setCredentials(data.admins || []);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err: any) {
      console.error('Erreur setup:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Initialisation du Système Admin</CardTitle>
        <CardDescription>
          Créer les comptes administrateurs MEREF et SFD
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!success && !error && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cette action va créer les comptes suivants :
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>1 Super Admin MEREF (admin@meref.gov.ml)</li>
                  <li>3 Admins SFD (NSM, Kafo Jiginew, Nyèsigiso)</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleSetup} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Création en cours...' : 'Initialiser le Système'}
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erreur :</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {success && credentials.length > 0 && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Système initialisé avec succès ! {credentials.length} administrateurs créés.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Identifiants créés :</h3>
              {credentials.map((cred, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{cred.role}</span>
                      {cred.sfd && (
                        <span className="text-xs text-muted-foreground">{cred.sfd}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <div className="font-mono">{cred.email}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mot de passe:</span>
                        <div className="font-mono">{cred.password}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Important :</strong> Notez ces identifiants en lieu sûr. 
                Vous pouvez maintenant vous connecter avec n'importe quel compte ci-dessus.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Rafraîchir la page pour se connecter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
