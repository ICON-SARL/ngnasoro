
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';

export function InitializeDemoData() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { activeSfdId } = useAuth();

  const handleInitializeData = async () => {
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Aucun SFD sélectionné",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('initialize-sfd-data', {
        body: { sfdId: activeSfdId },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Succès",
          description: "Données de démonstration initialisées avec succès",
        });
      } else {
        throw new Error(data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error('Error initializing demo data:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser les données de démonstration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isLoading || !activeSfdId}
      onClick={handleInitializeData}
    >
      {isLoading ? "Initialisation..." : "Initialiser données démo"}
    </Button>
  );
}
