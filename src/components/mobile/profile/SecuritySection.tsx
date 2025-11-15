import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Smartphone, Fingerprint, Lock, Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AuthenticationSystem from '@/components/AuthenticationSystem';

const SecuritySection = () => {
  const { toast } = useToast();
  const { biometricEnabled, toggleBiometricAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricDialog, setShowBiometricDialog] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    smsAuth: true,
    biometricAuth: false,
    twoFactorAuth: false
  });
  
  const handleToggleSecurity = (feature: string) => {
    toast({
      title: `${feature} mise à jour`,
      description: `La configuration de ${feature} a été modifiée`,
    });
  };

  const handleToggleBiometric = async (checked: boolean) => {
    try {
      setIsLoading(true);
      
      if (checked) {
        // If enabling biometrics, we need authentication
        setShowBiometricDialog(true);
        return;
      }
      
      // Disabling biometrics directly
      await toggleBiometricAuth();
      
      toast({
        title: "Biométrie désactivée",
        description: "L'authentification biométrique a été désactivée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification des paramètres",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBiometricEnrollmentComplete = async () => {
    setShowBiometricDialog(false);
    
    try {
      await toggleBiometricAuth();
      
      toast({
        title: "Biométrie activée",
        description: "L'authentification biométrique a été activée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'activation de la biométrie",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
              {isLoading ? (
                <div className="h-5 w-5 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Switch 
                  checked={biometricEnabled} 
                  onCheckedChange={handleToggleBiometric} 
                />
              )}
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
      
      <Dialog open={showBiometricDialog} onOpenChange={setShowBiometricDialog}>
        <DialogContent className="sm:max-w-md">
          <AuthenticationSystem 
            onComplete={handleBiometricEnrollmentComplete} 
            mode="enrollment"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecuritySection;
