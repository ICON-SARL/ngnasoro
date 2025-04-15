
import React, { useState, useEffect } from 'react';
import { verifyPermissionSystem } from '@/utils/auth/verifyPermissions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function PermissionSystemStatus() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSystem = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await verifyPermissionSystem();
      setStatus(result);
    } catch (err) {
      console.error('Erreur lors de la vérification du système:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystem();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut du Système de Permissions</CardTitle>
        <CardDescription>
          Vérification du système de rôles et permissions en temps réel
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Vérification en cours...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : status ? (
          <div className="space-y-4">
            <div className="flex items-center">
              {status.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="font-medium">
                Statut global: {status.success ? 'Fonctionnel' : 'Problèmes détectés'}
              </span>
            </div>
            
            <div className="grid gap-2 text-sm">
              <div className="flex items-center">
                {status.viewExists ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span>Vue SQL des permissions</span>
              </div>
              
              <div className="flex items-center">
                {status.edgeFunctionWorks ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span>Fonction Edge test-roles</span>
              </div>
              
              <div className="flex items-center">
                {status.roleCount > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                )}
                <span>Rôles configurés: {status.roleCount}</span>
              </div>
            </div>
            
            {!status.success && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription className="whitespace-pre-line">{status.message}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Aucune information disponible sur l'état du système de permissions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={checkSystem} 
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Vérifier à nouveau
        </Button>
      </CardFooter>
    </Card>
  );
}
