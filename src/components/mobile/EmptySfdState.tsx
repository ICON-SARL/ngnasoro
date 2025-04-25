
import React from 'react';
import { Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const EmptySfdState: React.FC = () => {
  const { toast } = useToast();

  return (
    <Card>
      <CardContent className="text-center p-6">
        <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
        <p className="text-sm text-gray-500 mb-4">
          Seul un administrateur SFD peut vous ajouter à un compte.
        </p>
        <Button 
          onClick={() => {
            toast({
              title: "Demande de compte SFD",
              description: "Contactez votre SFD pour l'ajout de votre compte."
            });
          }}
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          Contacter un SFD
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptySfdState;

