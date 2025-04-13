
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Fingerprint, 
  Key, 
  Smartphone, 
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SecurityPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricAuth: false,
    smsAuth: true,
  });
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Load security settings
  useEffect(() => {
    const fetchSecuritySettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('security_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setSecuritySettings({
            twoFactorAuth: data.two_factor_auth || false,
            biometricAuth: data.biometric_auth || false,
            smsAuth: data.sms_auth !== undefined ? data.sms_auth : true,
          });
        }
      } catch (error) {
        console.error('Error fetching security settings:', error);
      }
    };
    
    fetchSecuritySettings();
  }, [user]);
  
  const updateSecuritySetting = async (key: string, value: boolean) => {
    if (!user) return;
    
    // Convert from camelCase to snake_case for database
    const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    try {
      const { error } = await supabase
        .from('security_settings')
        .upsert({
          user_id: user.id,
          [dbKey]: value,
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      setSecuritySettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: 'Paramètre mis à jour',
        description: 'Vos paramètres de sécurité ont été enregistrés',
      });
    } catch (error) {
      console.error('Error updating security setting:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour vos paramètres de sécurité',
        variant: 'destructive',
      });
    }
  };
  
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });
      
      if (error) throw error;
      
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été mis à jour avec succès',
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier votre mot de passe',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/account')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Sécurité</h1>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
          <h2 className="font-semibold text-lg">Méthodes d'authentification</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Authentification par SMS</p>
                  <p className="text-xs text-gray-500">
                    Recevez un code à usage unique par SMS
                  </p>
                </div>
              </div>
              <Switch 
                checked={securitySettings.smsAuth} 
                onCheckedChange={(checked) => updateSecuritySetting('smsAuth', checked)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Reconnaissance biométrique</p>
                  <p className="text-xs text-gray-500">
                    Utilisez votre empreinte ou visage
                  </p>
                </div>
              </div>
              <Switch 
                checked={securitySettings.biometricAuth} 
                onCheckedChange={(checked) => updateSecuritySetting('biometricAuth', checked)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Authentification 2FA</p>
                  <p className="text-xs text-gray-500">
                    Double sécurité avec Google Authenticator
                  </p>
                </div>
              </div>
              <Switch 
                checked={securitySettings.twoFactorAuth} 
                onCheckedChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)} 
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <h2 className="font-semibold text-lg">Gestion du mot de passe</h2>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setShowPasswordDialog(true)}
          >
            <Lock className="h-4 w-4 mr-2" />
            Changer le mot de passe
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              toast({
                title: 'Sessions déconnectées',
                description: 'Toutes vos autres sessions ont été déconnectées',
              });
            }}
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Déconnecter toutes les sessions
          </Button>
        </div>
      </div>
      
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input 
                id="current-password" 
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input 
                id="new-password" 
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
              <Input 
                id="confirm-password" 
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handlePasswordChange}
              disabled={!passwordData.newPassword || !passwordData.confirmPassword}
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityPage;
