
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { SubsidyAlertThreshold } from '@/types/subsidyRequests';

interface SubsidyAlertSettingsProps {
  thresholds: SubsidyAlertThreshold[];
  isLoading: boolean;
}

export function SubsidyAlertSettings({ thresholds, isLoading }: SubsidyAlertSettingsProps) {
  const [newThreshold, setNewThreshold] = useState({
    name: '',
    amount: '',
    email: '',
    isActive: true
  });
  
  const handleAddThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would call an API to add the threshold
    console.log('Adding threshold:', newThreshold);
    
    // Reset form
    setNewThreshold({
      name: '',
      amount: '',
      email: '',
      isActive: true
    });
  };
  
  const handleToggleActive = (thresholdId: string, isActive: boolean) => {
    // In a real application, this would call an API to update the threshold
    console.log(`Toggling threshold ${thresholdId} active status to ${isActive}`);
  };
  
  const handleDeleteThreshold = (thresholdId: string) => {
    // In a real application, this would call an API to delete the threshold
    console.log(`Deleting threshold ${thresholdId}`);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres d'alerte de subvention</CardTitle>
          <CardDescription>
            Configurez des seuils d'alerte pour les demandes de prêt dépassant certains montants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAddThreshold} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold-name">Nom du seuil</Label>
              <Input
                id="threshold-name"
                placeholder="ex: Seuil standard"
                value={newThreshold.name}
                onChange={(e) => setNewThreshold({...newThreshold, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="threshold-amount">Montant (FCFA)</Label>
              <Input
                id="threshold-amount"
                type="number"
                placeholder="ex: 10000000"
                value={newThreshold.amount}
                onChange={(e) => setNewThreshold({...newThreshold, amount: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notification-email">Email de notification</Label>
              <Input
                id="notification-email"
                type="email"
                placeholder="email@example.com"
                value={newThreshold.email}
                onChange={(e) => setNewThreshold({...newThreshold, email: e.target.value})}
                required
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="threshold-active"
                  checked={newThreshold.isActive}
                  onCheckedChange={(checked) => setNewThreshold({...newThreshold, isActive: checked})}
                />
                <Label htmlFor="threshold-active">Actif</Label>
              </div>
              <Button type="submit" className="ml-auto">Ajouter un seuil</Button>
            </div>
          </form>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Seuils configurés</h3>
            
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : thresholds.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Emails de notification</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thresholds.map((threshold) => (
                    <TableRow key={threshold.id}>
                      <TableCell className="font-medium">{threshold.threshold_name}</TableCell>
                      <TableCell>{threshold.threshold_amount.toLocaleString()} FCFA</TableCell>
                      <TableCell>{threshold.notification_emails?.join(', ') || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={threshold.is_active}
                            onCheckedChange={(checked) => handleToggleActive(threshold.id, checked)}
                          />
                          <span>{threshold.is_active ? 'Actif' : 'Inactif'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteThreshold(threshold.id)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>Aucun seuil configuré</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
