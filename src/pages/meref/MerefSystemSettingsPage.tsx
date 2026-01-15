import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, Shield, Bell, Banknote, Database } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function MerefSystemSettingsPage() {
  const queryClient = useQueryClient();
  const [editedSettings, setEditedSettings] = React.useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['meref-system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meref_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data;
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('meref_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-system-settings'] });
      toast.success('Paramètre mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const getSettingValue = (key: string): string => {
    if (editedSettings[key] !== undefined) return editedSettings[key];
    return settings?.find(s => s.key === key)?.value || '';
  };

  const handleChange = (key: string, value: string) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string) => {
    const value = getSettingValue(key);
    updateSettingMutation.mutate({ key, value });
    setEditedSettings(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const settingsGroups = {
    general: [
      { key: 'system_name', label: 'Nom du système', description: 'Nom affiché dans l\'interface' },
      { key: 'default_currency', label: 'Devise par défaut', description: 'Devise utilisée pour les montants' },
      { key: 'maintenance_mode', label: 'Mode maintenance', description: 'Activer le mode maintenance' },
    ],
    security: [
      { key: 'max_login_attempts', label: 'Tentatives de connexion max', description: 'Avant verrouillage du compte' },
      { key: 'session_timeout_minutes', label: 'Timeout session (min)', description: 'Durée d\'inactivité avant déconnexion' },
      { key: 'password_expire_days', label: 'Expiration mot de passe (jours)', description: 'Durée de validité des mots de passe' },
    ],
    subsidies: [
      { key: 'subsidy_approval_required', label: 'Approbation requise', description: 'Demandes doivent être validées' },
      { key: 'max_loan_amount_without_approval', label: 'Montant max sans approbation', description: 'Seuil de validation manuelle' },
      { key: 'min_subsidy_balance_alert', label: 'Seuil alerte subvention', description: 'Alerte si solde SFD inférieur' },
      { key: 'mobile_money_transaction_fee', label: 'Frais Mobile Money (%)', description: 'Pourcentage de frais par transaction' },
    ],
    notifications: [
      { key: 'enable_notifications', label: 'Notifications activées', description: 'Activer les notifications système' },
      { key: 'system_email_address', label: 'Email système', description: 'Adresse email pour les notifications' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Paramètres Système</h1>
          <p className="text-muted-foreground">Configurez les paramètres globaux du système MEREF</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="subsidies">Subventions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {Object.entries(settingsGroups).map(([group, items]) => (
            <TabsContent key={group} value={group}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {group === 'general' && <Database className="h-5 w-5" />}
                    {group === 'security' && <Shield className="h-5 w-5" />}
                    {group === 'subsidies' && <Banknote className="h-5 w-5" />}
                    {group === 'notifications' && <Bell className="h-5 w-5" />}
                    Paramètres {group === 'general' ? 'Généraux' : group === 'security' ? 'de Sécurité' : group === 'subsidies' ? 'Subventions' : 'Notifications'}
                  </CardTitle>
                  <CardDescription>
                    Configurez les paramètres {group === 'general' ? 'généraux' : group === 'security' ? 'de sécurité' : group === 'subsidies' ? 'des subventions' : 'des notifications'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {items.map((item, index) => (
                    <React.Fragment key={item.key}>
                      {index > 0 && <Separator />}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <Label htmlFor={item.key}>{item.label}</Label>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.key === 'maintenance_mode' || item.key === 'subsidy_approval_required' || item.key === 'enable_notifications' ? (
                            <Switch
                              id={item.key}
                              checked={getSettingValue(item.key) === 'true'}
                              onCheckedChange={(checked) => {
                                handleChange(item.key, checked ? 'true' : 'false');
                                updateSettingMutation.mutate({ key: item.key, value: checked ? 'true' : 'false' });
                              }}
                            />
                          ) : (
                            <>
                              <Input
                                id={item.key}
                                value={getSettingValue(item.key)}
                                onChange={(e) => handleChange(item.key, e.target.value)}
                                className="w-48"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSave(item.key)}
                                disabled={editedSettings[item.key] === undefined}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
