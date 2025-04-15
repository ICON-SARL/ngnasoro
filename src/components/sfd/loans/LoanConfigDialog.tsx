
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface LoanConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const LoanConfigDialog: React.FC<LoanConfigDialogProps> = ({ 
  isOpen, 
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState({
    general: {
      defaultInterestRate: 5,
      maxLoanAmount: 5000000,
      minLoanAmount: 10000,
      maxDuration: 36,
      minDuration: 1,
      latePaymentFee: 2,
    },
    notifications: {
      sendReminders: true,
      reminderDays: 3,
      notifyAdmin: true,
      notifyClient: true,
    },
    validation: {
      requireGuarantor: false,
      requireDocuments: true,
      autoApproveBelow: 0,
      creditScoreMin: 0,
    }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here we would save the configuration to the database
      // For now, we just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration enregistrée",
        description: "Les paramètres de prêt ont été mis à jour avec succès."
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configuration des Prêts</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultInterestRate">Taux d'intérêt par défaut (%)</Label>
                <Input 
                  id="defaultInterestRate"
                  type="number"
                  value={config.general.defaultInterestRate}
                  onChange={e => updateConfig('general', 'defaultInterestRate', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latePaymentFee">Frais de retard (%)</Label>
                <Input 
                  id="latePaymentFee"
                  type="number"
                  value={config.general.latePaymentFee}
                  onChange={e => updateConfig('general', 'latePaymentFee', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minLoanAmount">Montant minimal (FCFA)</Label>
                <Input 
                  id="minLoanAmount"
                  type="number"
                  value={config.general.minLoanAmount}
                  onChange={e => updateConfig('general', 'minLoanAmount', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoanAmount">Montant maximal (FCFA)</Label>
                <Input 
                  id="maxLoanAmount"
                  type="number"
                  value={config.general.maxLoanAmount}
                  onChange={e => updateConfig('general', 'maxLoanAmount', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minDuration">Durée minimale (mois)</Label>
                <Input 
                  id="minDuration"
                  type="number"
                  value={config.general.minDuration}
                  onChange={e => updateConfig('general', 'minDuration', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDuration">Durée maximale (mois)</Label>
                <Input 
                  id="maxDuration"
                  type="number"
                  value={config.general.maxDuration}
                  onChange={e => updateConfig('general', 'maxDuration', parseInt(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sendReminders">Envoyer des rappels</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer des rappels avant l'échéance des paiements
                  </p>
                </div>
                <Switch 
                  id="sendReminders"
                  checked={config.notifications.sendReminders}
                  onCheckedChange={value => updateConfig('notifications', 'sendReminders', value)}
                />
              </div>
              
              {config.notifications.sendReminders && (
                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Jours avant échéance</Label>
                  <Input 
                    id="reminderDays"
                    type="number"
                    value={config.notifications.reminderDays}
                    onChange={e => updateConfig('notifications', 'reminderDays', parseInt(e.target.value))}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifyAdmin">Notifier l'administrateur</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer des notifications aux administrateurs
                  </p>
                </div>
                <Switch 
                  id="notifyAdmin"
                  checked={config.notifications.notifyAdmin}
                  onCheckedChange={value => updateConfig('notifications', 'notifyAdmin', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifyClient">Notifier le client</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer des notifications aux clients
                  </p>
                </div>
                <Switch 
                  id="notifyClient"
                  checked={config.notifications.notifyClient}
                  onCheckedChange={value => updateConfig('notifications', 'notifyClient', value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="validation" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireGuarantor">Exiger un garant</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger un garant pour les demandes de prêt
                  </p>
                </div>
                <Switch 
                  id="requireGuarantor"
                  checked={config.validation.requireGuarantor}
                  onCheckedChange={value => updateConfig('validation', 'requireGuarantor', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireDocuments">Exiger des documents</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger des documents justificatifs
                  </p>
                </div>
                <Switch 
                  id="requireDocuments"
                  checked={config.validation.requireDocuments}
                  onCheckedChange={value => updateConfig('validation', 'requireDocuments', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoApproveBelow">
                  Approbation automatique en dessous de (FCFA)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Montant en dessous duquel les prêts sont approuvés automatiquement (0 pour désactiver)
                </p>
                <Input 
                  id="autoApproveBelow"
                  type="number"
                  value={config.validation.autoApproveBelow}
                  onChange={e => updateConfig('validation', 'autoApproveBelow', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creditScoreMin">Score de crédit minimum</Label>
                <p className="text-sm text-muted-foreground">
                  Score de crédit minimum requis (0 pour désactiver)
                </p>
                <Input 
                  id="creditScoreMin"
                  type="number"
                  value={config.validation.creditScoreMin}
                  onChange={e => updateConfig('validation', 'creditScoreMin', parseInt(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoanConfigDialog;
