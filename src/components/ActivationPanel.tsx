
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useActivateTables } from '@/hooks/useActivateTables';

interface ActivationPanelProps {
  onActivationComplete?: () => void;
}

export function ActivationPanel({ onActivationComplete }: ActivationPanelProps) {
  const [activationStatus, setActivationStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { loading, activateUserRolesSync } = useActivateTables();

  const handleActivation = async () => {
    setActivationStatus('loading');
    try {
      const success = await activateUserRolesSync();
      if (success) {
        setActivationStatus('success');
        if (onActivationComplete) {
          setTimeout(onActivationComplete, 2000);
        }
      } else {
        setActivationStatus('error');
      }
    } catch (error) {
      console.error("Erreur d'activation:", error);
      setActivationStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Activation du Système</CardTitle>
        <CardDescription>
          Activez les tables et synchronisez les rôles utilisateurs pour accéder à toutes les fonctionnalités.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activationStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-700">Activation réussie!</AlertTitle>
            <AlertDescription className="text-green-600">
              Les tables et rôles utilisateurs ont été activés avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.
            </AlertDescription>
          </Alert>
        )}

        {activationStatus === 'error' && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-700">Erreur d'activation</AlertTitle>
            <AlertDescription className="text-red-600">
              Une erreur s'est produite lors de l'activation. Veuillez réessayer ou contacter l'administrateur système.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">Tables inactives détectées</h4>
              <p className="text-sm text-amber-700 mb-2">
                Plusieurs tables de votre base de données ne sont pas actives, ce qui peut empêcher l'application de fonctionner correctement.
              </p>
              <ul className="text-xs text-amber-600 list-disc list-inside mb-2">
                <li>client_activities</li>
                <li>client_adhesion_requests</li>
                <li>client_documents</li>
                <li>loan_activities</li>
                <li>loan_payments</li>
                <li>meref_loan_requests</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleActivation} 
          disabled={loading || activationStatus === 'success'}
        >
          {loading || activationStatus === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activation en cours...
            </>
          ) : activationStatus === 'success' ? (
            "Activation réussie ✓"
          ) : (
            "Activer les tables et synchroniser les rôles"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
