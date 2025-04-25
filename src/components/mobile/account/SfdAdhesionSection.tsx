
import React from 'react';
import { Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SfdAdhesionSection: React.FC = () => {
  const { toast } = useToast();
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Building className="h-5 w-5 mr-2 text-[#0D6A51]" />
          Comptes SFD
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
          <p className="text-sm text-gray-500 mb-4">
            Seul un administrateur SFD peut vous ajouter à un compte.
          </p>
          <Button 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            onClick={() => {
              toast({
                title: "Demande de compte SFD",
                description: "Contactez votre SFD pour l'ajout de votre compte."
              });
            }}
          >
            Contacter un SFD
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SfdAdhesionSection;

