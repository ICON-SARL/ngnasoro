
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActivateSfdMutation } from '@/components/admin/hooks/sfd-management/mutations/useActivateSfdMutation';

interface SfdActivationAlertProps {
  sfdId: string;
  sfdName?: string;
  status: string;
  onActivate?: () => void;
}

export function SfdActivationAlert({ sfdId, sfdName, status, onActivate }: SfdActivationAlertProps) {
  const activateSfd = useActivateSfdMutation();
  
  const handleActivate = async () => {
    try {
      await activateSfd.mutateAsync(sfdId);
      if (onActivate) {
        onActivate();
      }
    } catch (error) {
      console.error('Failed to activate SFD:', error);
    }
  };
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>SFD {status === 'suspended' ? 'suspendue' : 'inactive'}</AlertTitle>
      <AlertDescription className="flex flex-col space-y-3">
        <p>
          {status === 'suspended' 
            ? `La SFD ${sfdName || ''} est actuellement suspendue. Vous ne pouvez pas gérer les plans de prêts ou les demandes.` 
            : `La SFD ${sfdName || ''} n'est pas active. Activez-la pour accéder à toutes les fonctionnalités.`}
        </p>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleActivate}
            disabled={activateSfd.isPending}
            className="bg-white hover:bg-gray-100"
          >
            {activateSfd.isPending ? 'Activation...' : 'Activer la SFD'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
