
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Mail
} from 'lucide-react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { SubsidyAlertThreshold } from '@/types/subsidyRequests';

interface SubsidyAlertSettingsProps {
  thresholds: SubsidyAlertThreshold[];
  isLoading: boolean;
}

export function SubsidyAlertSettings({ thresholds, isLoading }: SubsidyAlertSettingsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [newThresholdName, setNewThresholdName] = useState('');
  const [newThresholdAmount, setNewThresholdAmount] = useState('');
  const [newThresholdEmails, setNewThresholdEmails] = useState('');
  const [newThresholdActive, setNewThresholdActive] = useState(true);
  
  // Edit state
  const [editThresholdName, setEditThresholdName] = useState('');
  const [editThresholdAmount, setEditThresholdAmount] = useState('');
  const [editThresholdEmails, setEditThresholdEmails] = useState('');
  const [editThresholdActive, setEditThresholdActive] = useState(true);
  
  const { 
    createAlertThreshold,
    updateAlertThreshold,
    deleteAlertThreshold
  } = useSubsidyRequests();
  
  const handleCreateThreshold = () => {
    if (!newThresholdName || !newThresholdAmount) return;
    
    createAlertThreshold.mutate({
      threshold_name: newThresholdName,
      threshold_amount: parseFloat(newThresholdAmount),
      notification_emails: newThresholdEmails.split(',').map(email => email.trim()).filter(email => email),
      is_active: newThresholdActive
    }, {
      onSuccess: () => {
        // Reset form
        setNewThresholdName('');
        setNewThresholdAmount('');
        setNewThresholdEmails('');
        setNewThresholdActive(true);
        setIsCreating(false);
      }
    });
  };
  
  const startEditing = (threshold: SubsidyAlertThreshold) => {
    setEditingId(threshold.id);
    setEditThresholdName(threshold.threshold_name);
    setEditThresholdAmount(threshold.threshold_amount.toString());
    setEditThresholdEmails((threshold.notification_emails || []).join(', '));
    setEditThresholdActive(threshold.is_active);
  };
  
  const cancelEditing = () => {
    setEditingId(null);
  };
  
  const handleUpdateThreshold = (id: string) => {
    if (!editThresholdName || !editThresholdAmount) return;
    
    updateAlertThreshold.mutate({
      id,
      updates: {
        threshold_name: editThresholdName,
        threshold_amount: parseFloat(editThresholdAmount),
        notification_emails: editThresholdEmails.split(',').map(email => email.trim()).filter(email => email),
        is_active: editThresholdActive
      }
    }, {
      onSuccess: () => {
        setEditingId(null);
      }
    });
  };
  
  const handleDeleteThreshold = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce seuil d\'alerte ?')) {
      deleteAlertThreshold.mutate(id);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paramètres d'alerte</CardTitle>
          <CardDescription>
            Configurer les seuils d'alerte pour les demandes de subvention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0D6A51]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Paramètres d'alerte</CardTitle>
            <CardDescription>
              Configurer les seuils d'alerte pour les demandes de subvention
            </CardDescription>
          </div>
          
          <Button 
            onClick={() => setIsCreating(!isCreating)} 
            variant={isCreating ? "secondary" : "default"}
          >
            {isCreating ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau seuil
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nouveau seuil d'alerte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thresholdName">Nom du seuil</Label>
                    <Input
                      id="thresholdName"
                      placeholder="Ex: Seuil critique"
                      value={newThresholdName}
                      onChange={(e) => setNewThresholdName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="thresholdAmount">Montant du seuil (FCFA)</Label>
                    <Input
                      id="thresholdAmount"
                      type="number"
                      placeholder="Ex: 10000000"
                      value={newThresholdAmount}
                      onChange={(e) => setNewThresholdAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thresholdEmails">Emails de notification (séparés par des virgules)</Label>
                  <Input
                    id="thresholdEmails"
                    placeholder="Ex: admin@example.com, manager@example.com"
                    value={newThresholdEmails}
                    onChange={(e) => setNewThresholdEmails(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="thresholdActive"
                    checked={newThresholdActive}
                    onCheckedChange={setNewThresholdActive}
                  />
                  <Label htmlFor="thresholdActive">Actif</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateThreshold}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-4">Seuils d'alerte configurés</h3>
          
          {thresholds.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
              <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Aucun seuil configuré</h3>
              <p className="text-gray-500 mt-1">
                Créez un seuil d'alerte pour être notifié des demandes importantes
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Montant (FCFA)</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thresholds.map((threshold) => (
                    <TableRow key={threshold.id}>
                      <TableCell>
                        {editingId === threshold.id ? (
                          <Input
                            value={editThresholdName}
                            onChange={(e) => setEditThresholdName(e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                            {threshold.threshold_name}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {editingId === threshold.id ? (
                          <Input
                            type="number"
                            value={editThresholdAmount}
                            onChange={(e) => setEditThresholdAmount(e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          <span className="font-medium">{threshold.threshold_amount.toLocaleString()}</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {editingId === threshold.id ? (
                          <Input
                            value={editThresholdEmails}
                            onChange={(e) => setEditThresholdEmails(e.target.value)}
                            className="w-full"
                            placeholder="emails séparés par des virgules"
                          />
                        ) : threshold.notification_emails && threshold.notification_emails.length > 0 ? (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm truncate max-w-[150px]">
                              {threshold.notification_emails.join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Aucun email</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {editingId === threshold.id ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={editThresholdActive}
                              onCheckedChange={setEditThresholdActive}
                            />
                            <span>Actif</span>
                          </div>
                        ) : (
                          <Badge className={threshold.is_active ? 
                            "bg-green-100 text-green-800" : 
                            "bg-gray-100 text-gray-800"
                          }>
                            {threshold.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {editingId === threshold.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUpdateThreshold(threshold.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(threshold)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteThreshold(threshold.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-blue-800 mb-2">Comment fonctionnent les alertes ?</h4>
          <p className="text-sm text-blue-700">
            Lorsqu'une demande de subvention dont le montant dépasse un seuil configuré est créée, 
            elle est automatiquement marquée d'une alerte. Ces demandes apparaissent dans l'onglet "Alertes" 
            et sont signalées par une icône d'alerte dans les listes et détails.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
