
import React, { useState } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash, Edit, Save, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SubsidyAlertSettingsProps {
  thresholds: any[];
  isLoading: boolean;
}

export const SubsidyAlertSettings: React.FC<SubsidyAlertSettingsProps> = ({ 
  thresholds, 
  isLoading 
}) => {
  const { createAlertThreshold, updateAlertThreshold, deleteAlertThreshold } = useSubsidyRequests();
  const [newThreshold, setNewThreshold] = useState({
    threshold_name: '',
    threshold_amount: '',
    is_active: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    threshold_name: '',
    threshold_amount: '',
    is_active: true
  });
  
  const handleCreateThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newThreshold.threshold_name || !newThreshold.threshold_amount) return;
    
    const amount = parseFloat(newThreshold.threshold_amount.replace(/\s/g, '').replace(',', '.'));
    
    await createAlertThreshold.mutateAsync({
      sfd_id: '', // TODO: Ajouter sfd_id approprié
      low_threshold: amount,
      critical_threshold: amount * 0.5
    });
    
    setNewThreshold({
      threshold_name: '',
      threshold_amount: '',
      is_active: true
    });
  };
  
  const startEditing = (threshold: any) => {
    setEditingId(threshold.id);
    setEditValues({
      threshold_name: threshold.threshold_name,
      threshold_amount: threshold.threshold_amount.toString(),
      is_active: threshold.is_active
    });
  };
  
  const cancelEditing = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = async (id: string) => {
    const amount = parseFloat(editValues.threshold_amount.replace(/\s/g, '').replace(',', '.'));
    
    await updateAlertThreshold.mutateAsync({
      id,
      updates: {
        threshold_name: editValues.threshold_name,
        threshold_amount: amount,
        is_active: editValues.is_active
      }
    });
    
    setEditingId(null);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce seuil d\'alerte ?')) {
      await deleteAlertThreshold.mutateAsync(id);
    }
  };
  
  const formatAmountInput = (value: string) => {
    value = value.replace(/\D/g, ''); // Enlever tous les caractères non numériques
    
    if (value) {
      const numberValue = parseInt(value, 10);
      return numberValue.toLocaleString('fr-FR');
    }
    
    return value;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seuils d'alerte pour les demandes de subvention</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateThreshold} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="threshold_name">Nom du seuil</Label>
                <Input
                  id="threshold_name"
                  value={newThreshold.threshold_name}
                  onChange={(e) => setNewThreshold({...newThreshold, threshold_name: e.target.value})}
                  placeholder="Ex: Demande importante"
                  required
                />
              </div>
              <div>
                <Label htmlFor="threshold_amount">Montant (FCFA)</Label>
                <Input
                  id="threshold_amount"
                  value={newThreshold.threshold_amount}
                  onChange={(e) => setNewThreshold({
                    ...newThreshold, 
                    threshold_amount: formatAmountInput(e.target.value)
                  })}
                  placeholder="Ex: 5 000 000"
                  required
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center mr-4 space-x-2">
                  <Switch
                    checked={newThreshold.is_active}
                    onCheckedChange={(checked) => setNewThreshold({...newThreshold, is_active: checked})}
                    id="is_active"
                  />
                  <Label htmlFor="is_active">Actif</Label>
                </div>
                <Button type="submit" className="flex-grow">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          </form>
          
          <Separator className="my-6" />
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thresholds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Aucun seuil d'alerte défini
                    </TableCell>
                  </TableRow>
                ) : (
                  thresholds.map((threshold) => (
                    <TableRow key={threshold.id}>
                      <TableCell>
                        {editingId === threshold.id ? (
                          <Input
                            value={editValues.threshold_name}
                            onChange={(e) => setEditValues({...editValues, threshold_name: e.target.value})}
                          />
                        ) : (
                          threshold.threshold_name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === threshold.id ? (
                          <Input
                            value={editValues.threshold_amount}
                            onChange={(e) => setEditValues({
                              ...editValues, 
                              threshold_amount: formatAmountInput(e.target.value)
                            })}
                          />
                        ) : (
                          `${threshold.threshold_amount.toLocaleString()} FCFA`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === threshold.id ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={editValues.is_active}
                              onCheckedChange={(checked) => setEditValues({...editValues, is_active: checked})}
                            />
                            <span>{editValues.is_active ? 'Actif' : 'Inactif'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className={`h-2 w-2 rounded-full ${threshold.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span>{threshold.is_active ? 'Actif' : 'Inactif'}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === threshold.id ? (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleSaveEdit(threshold.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => startEditing(threshold)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(threshold.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
