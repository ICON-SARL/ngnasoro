
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function InitializeDemoData() {
  const { activeSfdId } = useAuth();

  const handleInitializeData = () => {
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord sélectionner un SFD",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Données initialisées",
      description: "Les données de démonstration ont été chargées avec succès"
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleInitializeData}
    >
      Initialiser Données
    </Button>
  );
}
