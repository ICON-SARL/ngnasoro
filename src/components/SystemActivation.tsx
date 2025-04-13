
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Loader2, CheckCircle2, AlertTriangle, Settings } from 'lucide-react';
import { useActivateTables } from '@/hooks/useActivateTables';

export function SystemActivation() {
  const [activated, setActivated] = useState(false);
  const [step, setStep] = useState(1);
  const [stepStatus, setStepStatus] = useState<Record<number, 'idle' | 'loading' | 'success' | 'error'>>({
    1: 'idle',
    2: 'idle',
    3: 'idle'
  });
  const { loading, activateSystem, activateUserRolesSync } = useActivateTables();

  const handleActivate = async () => {
    // Étape 1: Activation des tables
    setStepStatus(prev => ({ ...prev, 1: 'loading' }));
    try {
      const success = await activateSystem();
      setStepStatus(prev => ({ ...prev, 1: success ? 'success' : 'error' }));
      
      if (!success) return;

      // Étape 2: Synchronisation des rôles
      setStep(2);
      setStepStatus(prev => ({ ...prev, 2: 'loading' }));
      const roleSuccess = await activateUserRolesSync();
      setStepStatus(prev => ({ ...prev, 2: roleSuccess ? 'success' : 'error' }));
      
      if (!roleSuccess) return;

      // Étape 3: Finalisation
      setStep(3);
      setStepStatus(prev => ({ ...prev, 3: 'success' }));
      setActivated(true);
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
      setStepStatus(prev => ({ ...prev, step: 'error' }));
    }
  };

  const getStepIcon = (stepNumber: number) => {
    const status = stepStatus[stepNumber];
    if (status === 'loading') return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    if (status === 'success') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === 'error') return <AlertTriangle className="h-5 w-5 text-destructive" />;
    return <Settings className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Activation du Système</CardTitle>
        <CardDescription>
          Activez les fonctionnalités et les permissions pour toutes les tables de la base de données
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activated ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Système activé</AlertTitle>
            <AlertDescription>
              Toutes les tables ont été activées et configurées correctement. 
              Le système est prêt à être utilisé.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {getStepIcon(1)}
              <div className="flex-1">
                <p className="font-medium">Configuration des tables</p>
                <p className="text-sm text-muted-foreground">
                  Activer RLS et configurer les permissions pour toutes les tables
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStepIcon(2)}
              <div className="flex-1">
                <p className="font-medium">Synchronisation des rôles</p>
                <p className="text-sm text-muted-foreground">
                  Synchroniser les rôles utilisateurs entre les différentes tables
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStepIcon(3)}
              <div className="flex-1">
                <p className="font-medium">Finalisation</p>
                <p className="text-sm text-muted-foreground">
                  Validation de l'activation du système
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!activated ? (
          <Button 
            onClick={handleActivate} 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activer le système
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            Rafraîchir l'application
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
