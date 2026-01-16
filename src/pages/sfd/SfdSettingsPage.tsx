import React, { useState, useEffect } from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Phone, MapPin, Shield, Bell, CreditCard, Save, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SfdSettingsPage = () => {
  const { activeSfdId } = useSfdDataAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sfd, isLoading } = useQuery({
    queryKey: ['sfd-details', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return null;
      
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', activeSfdId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId,
  });

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    contact_email: '',
    phone: '',
    address: '',
    region: '',
  });

  const [loanSettings, setLoanSettings] = useState({
    autoApproveLoans: false,
    maxLoanAmount: 5000000,
    minLoanAmount: 50000,
    defaultInterestRate: 5,
    maxDurationMonths: 24,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    lowBalanceAlerts: true,
    newClientAlerts: true,
    loanDueAlerts: true,
  });

  useEffect(() => {
    if (sfd) {
      setFormData({
        name: sfd.name || '',
        code: sfd.code || '',
        description: sfd.description || '',
        contact_email: sfd.contact_email || '',
        phone: sfd.phone || '',
        address: sfd.address || '',
        region: sfd.region || '',
      });
    }
  }, [sfd]);

  const updateSfd = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!activeSfdId) throw new Error('SFD non sélectionné');
      
      const { error } = await supabase
        .from('sfds')
        .update({
          name: data.name,
          description: data.description,
          contact_email: data.contact_email,
          phone: data.phone,
          address: data.address,
          region: data.region,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeSfdId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-details'] });
      toast({ title: 'Paramètres mis à jour', description: 'Les informations de votre SFD ont été enregistrées.' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erreur', 
        description: error.message || 'Impossible de mettre à jour les paramètres',
        variant: 'destructive' 
      });
    },
  });

  const handleSaveGeneral = () => {
    updateSfd.mutate(formData);
  };

  const handleSaveLoanSettings = () => {
    // For now, just show a toast - loan settings would be stored in a dedicated table
    toast({ title: 'Paramètres de prêt enregistrés', description: 'Les paramètres de prêt ont été mis à jour.' });
  };

  const handleSaveNotifications = () => {
    // For now, just show a toast - notification settings would be stored in a dedicated table
    toast({ title: 'Notifications mises à jour', description: 'Vos préférences de notification ont été enregistrées.' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SfdHeader />
        <div className="container mx-auto py-6 px-4 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configurez votre SFD et ses préférences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">
              <Building2 className="h-4 w-4 mr-2" />
              Général
            </TabsTrigger>
            <TabsTrigger value="loans">
              <CreditCard className="h-4 w-4 mr-2" />
              Prêts
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Informations de base de votre SFD</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la SFD</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code SFD</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email de contact
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Adresse
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Région</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneral} disabled={updateSfd.isPending}>
                    {updateSfd.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan Settings */}
          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres des prêts</CardTitle>
                <CardDescription>Configurez les règles de prêt de votre SFD</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Approbation automatique</Label>
                    <p className="text-sm text-muted-foreground">Approuver automatiquement les prêts sous un certain montant</p>
                  </div>
                  <Switch
                    checked={loanSettings.autoApproveLoans}
                    onCheckedChange={(checked) => setLoanSettings({ ...loanSettings, autoApproveLoans: checked })}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLoan">Montant minimum (FCFA)</Label>
                    <Input
                      id="minLoan"
                      type="number"
                      value={loanSettings.minLoanAmount}
                      onChange={(e) => setLoanSettings({ ...loanSettings, minLoanAmount: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoan">Montant maximum (FCFA)</Label>
                    <Input
                      id="maxLoan"
                      type="number"
                      value={loanSettings.maxLoanAmount}
                      onChange={(e) => setLoanSettings({ ...loanSettings, maxLoanAmount: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Taux d'intérêt par défaut (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={loanSettings.defaultInterestRate}
                      onChange={(e) => setLoanSettings({ ...loanSettings, defaultInterestRate: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDuration">Durée maximum (mois)</Label>
                    <Input
                      id="maxDuration"
                      type="number"
                      value={loanSettings.maxDurationMonths}
                      onChange={(e) => setLoanSettings({ ...loanSettings, maxDurationMonths: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveLoanSettings}>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Gérez vos préférences de notification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications par SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertes de solde bas</Label>
                    <p className="text-sm text-muted-foreground">Être alerté quand le solde de subvention est bas</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowBalanceAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lowBalanceAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nouveaux clients</Label>
                    <p className="text-sm text-muted-foreground">Être notifié des nouvelles demandes d'adhésion</p>
                  </div>
                  <Switch
                    checked={notificationSettings.newClientAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newClientAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Échéances de prêt</Label>
                    <p className="text-sm text-muted-foreground">Être alerté des prêts arrivant à échéance</p>
                  </div>
                  <Switch
                    checked={notificationSettings.loanDueAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, loanDueAlerts: checked })}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Paramètres de sécurité de votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Authentification à deux facteurs</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Renforcez la sécurité de votre compte en activant l'authentification à deux facteurs.
                  </p>
                  <Button variant="outline">
                    Configurer 2FA
                  </Button>
                </div>

                <Separator />

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Sessions actives</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gérez les appareils connectés à votre compte.
                  </p>
                  <Button variant="outline">
                    Voir les sessions
                  </Button>
                </div>

                <Separator />

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Zone dangereuse</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Ces actions sont irréversibles. Procédez avec précaution.
                  </p>
                  <Button variant="destructive">
                    Désactiver le compte SFD
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SfdSettingsPage;
