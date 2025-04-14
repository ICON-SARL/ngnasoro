
import React from 'react';
import { useSfdAdminsList } from '../hooks/sfd-admin/useSfdAdminsList';
import { useAssociateSfdAdmin } from '../hooks/sfd-admin/useAssociateSfdAdmin';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SfdAdminVerificationProps {
  sfdId: string;
  sfdName: string;
}

export function SfdAdminVerification({ sfdId, sfdName }: SfdAdminVerificationProps) {
  const { sfdAdmins, isLoading, error, refetch } = useSfdAdminsList(sfdId);
  const hasAdmins = sfdAdmins && sfdAdmins.length > 0;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérification des Associations</CardTitle>
          <CardDescription>
            Vérification de l'association administrateur pour {sfdName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vérification des Associations</CardTitle>
        <CardDescription>
          État de l'association administrateur pour {sfdName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Impossible de vérifier les associations : {error}
            </AlertDescription>
          </Alert>
        ) : hasAdmins ? (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>SFD Correctement Configurée</AlertTitle>
            <AlertDescription>
              Cette SFD est associée à {sfdAdmins.length} administrateur{sfdAdmins.length > 1 ? 's' : ''}.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Incomplète</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                Cette SFD n'a aucun administrateur associé. Elle ne sera pas visible dans l'application
                tant qu'elle n'aura pas au moins un administrateur.
              </p>
              <Button 
                onClick={() => refetch()}
                variant="outline"
                size="sm"
              >
                Vérifier à nouveau
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {hasAdmins && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Administrateurs associés :</h4>
            <ul className="space-y-2">
              {sfdAdmins.map((admin) => (
                <li key={admin.id} className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{admin.full_name}</span>
                  <span className="text-sm text-muted-foreground">({admin.email})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
