
import React, { useState } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    low_threshold: '',
    critical_threshold: '',
    sfd_id: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    low_threshold: '',
    critical_threshold: ''
  });
  
  const handleCreateThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newThreshold.low_threshold || !newThreshold.sfd_id) return;
    
    const lowAmount = parseFloat(newThreshold.low_threshold.replace(/\s/g, '').replace(',', '.'));
    const criticalAmount = newThreshold.critical_threshold 
      ? parseFloat(newThreshold.critical_threshold.replace(/\s/g, '').replace(',', '.'))
      : lowAmount * 0.5;
    
    await createAlertThreshold.mutateAsync({
      sfd_id: newThreshold.sfd_id,
      low_threshold: lowAmount,
      critical_threshold: criticalAmount
    });
    
    setNewThreshold({
      low_threshold: '',
      critical_threshold: '',
      sfd_id: ''
    });
  };
  
  const startEditing = (threshold: any) => {
    setEditingId(threshold.id);
    setEditValues({
      low_threshold: threshold.low_threshold?.toString() || '',
      critical_threshold: threshold.critical_threshold?.toString() || ''
    });
  };
  
  const cancelEditing = () => {
    setEditingId(null);
  };
  
  const handleSaveEdit = async (id: string) => {
    const lowAmount = parseFloat(editValues.low_threshold.replace(/\s/g, '').replace(',', '.'));
    
    await updateAlertThreshold.mutateAsync({
      id,
      updates: {
        threshold_amount: lowAmount
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
    value = value.replace(/\D/g, '');
    
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
                <Label htmlFor="low_threshold">Seuil bas (FCFA)</Label>
                <Input
                  id="low_threshold"
                  value={newThreshold.low_threshold}
                  onChange={(e) => setNewThreshold({
                    ...newThreshold, 
                    low_threshold: formatAmountInput(e.target.value)
                  })}
                  placeholder="Ex: 1 000 000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="critical_threshold">Seuil critique (FCFA)</Label>
                <Input
                  id="critical_threshold"
                  value={newThreshold.critical_threshold}
                  onChange={(e) => setNewThreshold({
                    ...newThreshold, 
                    critical_threshold: formatAmountInput(e.target.value)
                  })}
                  placeholder="Ex: 500 000"
                />
              </div>
              <div className="flex items-end">
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
                  <TableHead>SFD</TableHead>
                  <TableHead>Seuil bas</TableHead>
                  <TableHead>Seuil critique</TableHead>
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
                        {threshold.sfd_id}
                      </TableCell>
                      <TableCell>
                        {editingId === threshold.id ? (
                          <Input
                            value={editValues.low_threshold}
                            onChange={(e) => setEditValues({
                              ...editValues, 
                              low_threshold: formatAmountInput(e.target.value)
                            })}
                          />
                        ) : (
                          `${threshold.low_threshold?.toLocaleString() || 0} FCFA`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === threshold.id ? (
                          <Input
                            value={editValues.critical_threshold}
                            onChange={(e) => setEditValues({
                              ...editValues, 
                              critical_threshold: formatAmountInput(e.target.value)
                            })}
                          />
                        ) : (
                          `${threshold.critical_threshold?.toLocaleString() || 0} FCFA`
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
