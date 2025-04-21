
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SfdActivationAlertProps {
  sfdId: string;
  sfdName?: string;
  status: string;
  onActivate?: () => void;
}

export function SfdActivationAlert({ sfdId, sfdName, status, onActivate }: SfdActivationAlertProps) {
  const [isActivating, setIsActivating] = React.useState(false);
  const { toast } = useToast();
  
  const handleActivate = async () => {
    if (!sfdId) return;
    
    setIsActivating(true);
    try {
      // Activer la SFD
      const { error } = await supabase
        .from('sfds')
        .update({ status: 'active' })
        .eq('id', sfdId);
        
      if (error) throw error;
      
      toast({
        title: 'SFD activée',
        description: `${sfdName || 'La SFD'} a été activée avec succès.`,
      });
      
      // Callback
      if (onActivate) {
        onActivate();
      }
    } catch (error) {
      console.error('Error activating SFD:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer la SFD. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
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
            disabled={isActivating}
            className="bg-white hover:bg-gray-100"
          >
            {isActivating ? 'Activation...' : 'Activer la SFD'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
