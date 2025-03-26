
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Smartphone, Fingerprint, Key, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SecuritySection = () => {
  const { toast } = useToast();
  
  const handleToggleSecurity = (feature: string) => {
    toast({
      title: `${feature} mise à jour`,
      description: `La configuration de ${feature} a été modifiée`,
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sécurité & Authentification</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Authentification par SMS</p>
                <p className="text-xs text-gray-500">
                  Recevez un code à usage unique par SMS
                </p>
              </div>
            </div>
            <Switch defaultChecked onCheckedChange={() => handleToggleSecurity('authentification SMS')} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Fingerprint className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Reconnaissance biométrique</p>
                <p className="text-xs text-gray-500">
                  Utilisez votre empreinte ou visage
                </p>
              </div>
            </div>
            <Switch onCheckedChange={() => handleToggleSecurity('biométrie')} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Authentification 2FA</p>
                <p className="text-xs text-gray-500">
                  Double sécurité avec Google Authenticator
                </p>
              </div>
            </div>
            <Switch onCheckedChange={() => handleToggleSecurity('2FA')} />
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => toast({
              title: "Sécurité avancée",
              description: "Configuration de la sécurité avancée à venir",
            })}
          >
            <Shield className="h-4 w-4 mr-2" />
            Paramètres de sécurité avancés
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySection;
