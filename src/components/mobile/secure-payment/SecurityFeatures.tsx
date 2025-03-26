
import React, { useState } from 'react';
import { Shield, Fingerprint, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const SecurityFeatures: React.FC = () => {
  const { toast } = useToast();
  const [isDoubleApproval, setIsDoubleApproval] = useState(true);
  
  const requestBiometricVerification = () => {
    toast({
      title: "Vérification biométrique",
      description: "Veuillez valider votre identité via votre appareil mobile.",
    });
    
    // Simulate biometric verification
    setTimeout(() => {
      toast({
        title: "Identité confirmée",
        description: "Vérification biométrique réussie.",
      });
    }, 2000);
  };
  
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-medium mb-4 flex items-center">
        <Shield className="h-4 w-4 mr-2 text-[#0D6A51]" />
        Fonctionnalités de sécurité avancées
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Fingerprint className="h-4 w-4 text-green-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Vérification biométrique</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Requise pour les transactions supérieures à 50,000 FCFA
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={requestBiometricVerification}
            >
              Vérifier maintenant
            </Button>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Check className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Double approbation</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Pour les remboursements anticipés et transactions sensibles
            </p>
            <div className="flex items-center space-x-2">
              <Switch 
                id="double-approval" 
                checked={isDoubleApproval}
                onCheckedChange={setIsDoubleApproval}
              />
              <Label htmlFor="double-approval">Activée</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
