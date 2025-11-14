import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SystemSetting {
  key: string;
  value: string;
  description?: string;
}

const SystemSettingsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('meref_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((setting: SystemSetting) => {
        settingsMap[setting.key] = setting.value || '';
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('meref_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key);

        if (error) throw error;
      }

      toast({
        title: 'Succès',
        description: 'Les paramètres ont été sauvegardés',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Paramètres Système
        </h1>
        <p className="text-muted-foreground mt-2">
          Configuration globale du système MEREF-SFD
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enregistrement SFD</CardTitle>
            <CardDescription>
              Configuration de l'approbation des nouvelles SFD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sfd_registration_approval">Approbation requise</Label>
              <Switch
                id="sfd_registration_approval"
                checked={settings.sfd_registration_approval === 'true'}
                onCheckedChange={(checked) => 
                  updateSetting('sfd_registration_approval', checked.toString())
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Paramètres de sécurité et d'authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="max_login_attempts">Tentatives de connexion maximales</Label>
              <Input
                id="max_login_attempts"
                type="number"
                value={settings.max_login_attempts || ''}
                onChange={(e) => updateSetting('max_login_attempts', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="session_timeout_minutes">Timeout session (minutes)</Label>
              <Input
                id="session_timeout_minutes"
                type="number"
                value={settings.session_timeout_minutes || ''}
                onChange={(e) => updateSetting('session_timeout_minutes', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password_expire_days">Expiration mot de passe (jours)</Label>
              <Input
                id="password_expire_days"
                type="number"
                value={settings.password_expire_days || ''}
                onChange={(e) => updateSetting('password_expire_days', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prêts et Subventions</CardTitle>
            <CardDescription>
              Gestion des limites et approbations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="subsidy_approval_required">Approbation subvention requise</Label>
              <Switch
                id="subsidy_approval_required"
                checked={settings.subsidy_approval_required === 'true'}
                onCheckedChange={(checked) => 
                  updateSetting('subsidy_approval_required', checked.toString())
                }
              />
            </div>
            <div>
              <Label htmlFor="max_loan_amount_without_approval">
                Montant max prêt sans approbation (FCFA)
              </Label>
              <Input
                id="max_loan_amount_without_approval"
                type="number"
                value={settings.max_loan_amount_without_approval || ''}
                onChange={(e) => updateSetting('max_loan_amount_without_approval', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="min_subsidy_balance_alert">
                Seuil alerte solde subvention (FCFA)
              </Label>
              <Input
                id="min_subsidy_balance_alert"
                type="number"
                value={settings.min_subsidy_balance_alert || ''}
                onChange={(e) => updateSetting('min_subsidy_balance_alert', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres Généraux</CardTitle>
            <CardDescription>
              Configuration système générale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="default_currency">Devise par défaut</Label>
              <Input
                id="default_currency"
                value={settings.default_currency || ''}
                onChange={(e) => updateSetting('default_currency', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="system_email_address">Email système</Label>
              <Input
                id="system_email_address"
                type="email"
                value={settings.system_email_address || ''}
                onChange={(e) => updateSetting('system_email_address', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="mobile_money_transaction_fee">
                Frais transaction Mobile Money (%)
              </Label>
              <Input
                id="mobile_money_transaction_fee"
                type="number"
                step="0.01"
                value={settings.mobile_money_transaction_fee || ''}
                onChange={(e) => updateSetting('mobile_money_transaction_fee', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance_mode">Mode maintenance</Label>
              <Switch
                id="maintenance_mode"
                checked={settings.maintenance_mode === 'true'}
                onCheckedChange={(checked) => 
                  updateSetting('maintenance_mode', checked.toString())
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable_notifications">Activer notifications</Label>
              <Switch
                id="enable_notifications"
                checked={settings.enable_notifications === 'true'}
                onCheckedChange={(checked) => 
                  updateSetting('enable_notifications', checked.toString())
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
