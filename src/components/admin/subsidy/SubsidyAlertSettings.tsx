
import React, { useState } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';

interface SubsidyAlertSettingsProps {
  thresholds: any[];
  isLoading: boolean;
}

export function SubsidyAlertSettings({ thresholds, isLoading }: SubsidyAlertSettingsProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState<any>(null);
  const [formData, setFormData] = useState({
    threshold_name: '',
    threshold_amount: '',
    notification_emails: '',
    is_active: true
  });
  
  const { 
    createAlertThreshold, 
    updateAlertThreshold,
    deleteAlertThreshold 
  } = useSubsidyRequests();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleEditThreshold = (threshold: any) => {
    setCurrentThreshold(threshold);
    setFormData({
      threshold_name: threshold.threshold_name,
      threshold_amount: threshold.threshold_amount.toString(),
      notification_emails: threshold.notification_emails ? threshold.notification_emails.join(', ') : '',
      is_active: threshold.is_active
    });
    setIsEditing(true);
    setOpenDialog(true);
  };
  
  const handleCreateThreshold = () => {
    setCurrentThreshold(null);
    setFormData({
      threshold_name: '',
      threshold_amount: '',
      notification_emails: '',
      is_active: true
    });
    setIsEditing(false);
    setOpenDialog(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the notification emails
    const emails = formData.notification_emails
      ? formData.notification_emails.split(',').map(email => email.trim())
      : [];
      
    const thresholdData = {
      threshold_name: formData.threshold_name,
      threshold_amount: parseFloat(formData.threshold_amount),
      notification_emails: emails.length > 0 ? emails : null,
      is_active: formData.is_active
    };
    
    if (isEditing && currentThreshold) {
      await updateAlertThreshold.mutateAsync({
        id: currentThreshold.id,
        updates: thresholdData
      });
    } else {
      await createAlertThreshold.mutateAsync(thresholdData);
    }
    
    setOpenDialog(false);
  };
  
  const handleDeleteThreshold = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce seuil d\'alerte ?')) {
      await deleteAlertThreshold.mutateAsync(id);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Paramètres d'Alerte</CardTitle>
              <CardDescription>
                Configurez les seuils d'alerte pour les demandes de subvention
              </CardDescription>
            </div>
            <Button onClick={handleCreateThreshold}>
              <Plus className="h-4 w-4 mr-1" />
              Nouveau seuil
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Chargement des seuils d'alerte...</p>
            </div>
          ) : thresholds.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-md">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Aucun seuil d'alerte configuré</p>
              <Button onClick={handleCreateThreshold} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-1" />
                Configurer un seuil d'alerte
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {thresholds.map((threshold) => (
                <div 
                  key={threshold.id} 
                  className={`p-4 rounded-md border ${threshold.is_active ? '' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <AlertTriangle className={`h-5 w-5 mr-2 ${threshold.is_active ? 'text-amber-500' : 'text-gray-400'}`} />
                      <h3 className="font-medium">{threshold.threshold_name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditThreshold(threshold)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteThreshold(threshold.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Montant seuil</p>
                      <p className="font-medium">{threshold.threshold_amount.toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <p className={threshold.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                        {threshold.is_active ? 'Actif' : 'Inactif'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Notifications</p>
                      <p className="truncate max-w-[200px]">
                        {threshold.notification_emails && threshold.notification_emails.length > 0
                          ? threshold.notification_emails.join(', ')
                          : 'Aucune'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Modifier le seuil d\'alerte' : 'Nouveau seuil d\'alerte'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="threshold_name">Nom du seuil</Label>
                <Input 
                  id="threshold_name" 
                  name="threshold_name"
                  value={formData.threshold_name}
                  onChange={handleInputChange}
                  placeholder="ex: Subventions élevées"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="threshold_amount">Montant seuil (FCFA)</Label>
                <Input 
                  id="threshold_amount" 
                  name="threshold_amount"
                  value={formData.threshold_amount}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="ex: 5000000"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Les demandes égales ou supérieures à ce montant déclencheront une alerte
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notification_emails">Emails de notification (séparés par des virgules)</Label>
                <Input 
                  id="notification_emails" 
                  name="notification_emails"
                  value={formData.notification_emails}
                  onChange={handleInputChange}
                  placeholder="ex: admin@meref.org, finance@meref.org"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active" 
                  name="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, is_active: checked}))}
                />
                <Label htmlFor="is_active">Activer ce seuil d'alerte</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setOpenDialog(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {isEditing ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
