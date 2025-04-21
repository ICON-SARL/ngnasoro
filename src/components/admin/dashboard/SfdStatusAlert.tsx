
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowRight, RefreshCw, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSfdStatusCheck } from '@/hooks/useSfdStatusCheck';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SfdStatusAlert = () => {
  const { data: sfdStatus, isLoading, refetch } = useSfdStatusCheck();
  const { toast } = useToast();
  const [activating, setActivating] = React.useState(false);
  
  if (isLoading || !sfdStatus || sfdStatus.hasActiveSfds) {
    return null;
  }
  
  const handleRefresh = () => {
    refetch();
  };
  
  // Fonction pour activer rapidement une SFD depuis l'alerte
  const handleQuickActivate = async () => {
    setActivating(true);
    try {
      // Récupérer la première SFD inactive
      const { data: inactiveSfds, error: fetchError } = await supabase
        .from('sfds')
        .select('id, name')
        .not('status', 'eq', 'active')
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      if (inactiveSfds && inactiveSfds.length > 0) {
        const sfdToActivate = inactiveSfds[0];
        
        // Activer la SFD
        const { error: updateError } = await supabase
          .from('sfds')
          .update({ status: 'active' })
          .eq('id', sfdToActivate.id);
          
        if (updateError) throw updateError;
        
        toast({
          title: 'SFD activée',
          description: `${sfdToActivate.name} a été activée avec succès.`,
        });
        
        // Rafraîchir les données
        refetch();
      } else {
        toast({
          title: 'Aucune SFD disponible',
          description: 'Aucune SFD inactive n\'a été trouvée pour l\'activation.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation rapide de la SFD:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer la SFD. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setActivating(false);
    }
  };
  
  return (
    <Alert variant="warning" className="mb-6 border-2 border-amber-400">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-lg text-amber-700">Aucune SFD active détectée</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p className="text-amber-700">
          Aucune SFD active n'a été détectée. Les clients ne pourront pas accéder à la plateforme.
          Veuillez activer au moins une SFD pour permettre l'accès aux services.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <Link 
            to="/sfd-management" 
            className="bg-amber-100 text-amber-800 px-4 py-2 rounded hover:bg-amber-200 inline-flex items-center text-sm font-medium"
          >
            Gérer les SFDs
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            className="text-amber-700 border-amber-400"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Vérifier à nouveau
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleQuickActivate}
            disabled={activating}
          >
            <Building className="mr-1 h-4 w-4" />
            {activating ? 'Activation...' : 'Activer une SFD'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
