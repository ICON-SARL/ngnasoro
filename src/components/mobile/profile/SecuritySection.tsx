import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Smartphone, Fingerprint, Lock, LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AuthenticationSystem from '@/components/AuthenticationSystem';
import LogoutButton from '@/components/LogoutButton';

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
      description: `La configuration a été modifiée`,
    });
  };

  const handleToggleBiometric = async (checked: boolean) => {
    try {
      setIsLoading(true);
      
      if (checked) {
        setShowBiometricDialog(true);
        return;
      }
      
      await toggleBiometricAuth();
      
      toast({
        title: "Biométrie désactivée",
        description: "L'authentification biométrique a été désactivée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
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
        description: "L'authentification biométrique a été activée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const securityItems = [
    {
      icon: Smartphone,
      title: 'SMS',
      description: 'Code à usage unique',
      checked: securitySettings.smsAuth,
      onToggle: () => handleToggleSecurity('SMS'),
    },
    {
      icon: Fingerprint,
      title: 'Biométrie',
      description: 'Empreinte ou visage',
      checked: biometricEnabled,
      onToggle: handleToggleBiometric,
      loading: isLoading,
    },
    {
      icon: Lock,
      title: '2FA',
      description: 'Double authentification',
      checked: securitySettings.twoFactorAuth,
      onToggle: () => handleToggleSecurity('2FA'),
    },
  ];

  return (
    <>
      <Card className="border-0 shadow-sm bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Sécurité</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {securityItems.map((item) => (
            <div 
              key={item.title}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {item.loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Switch 
                  checked={item.checked} 
                  onCheckedChange={item.onToggle}
                  className="scale-90"
                />
              )}
            </div>
          ))}

          {/* Bouton Déconnexion */}
          <div className="pt-3">
            <LogoutButton 
              variant="outline" 
              size="sm"
              className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              text="Se déconnecter"
              redirectPath="/auth"
            />
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
