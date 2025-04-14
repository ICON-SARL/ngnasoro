import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { sfdApi } from '@/utils/api/modules/sfdApi'; 
import { useSfdAssociation } from '@/hooks/admin/useSfdAssociation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building, Check, X, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface UserSfdAssociationsProps {
  userId: string;
  userName?: string;
}

export function UserSfdAssociations({ userId, userName }: UserSfdAssociationsProps) {
  const [availableSfds, setAvailableSfds] = useState<any[]>([]);
  const [isLoadingSfds, setIsLoadingSfds] = useState(false);
  const [selectedSfdId, setSelectedSfdId] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [makeDefault, setMakeDefault] = useState(false);
  
  const { 
    isLoading, 
    userSfds, 
    fetchUserSfds, 
    associateWithSfd, 
    removeAssociation 
  } = useSfdAssociation();
  
  useEffect(() => {
    if (userId) {
      fetchUserSfds(userId);
      loadAvailableSfds();
    }
  }, [userId]);
  
  const loadAvailableSfds = async () => {
    setIsLoadingSfds(true);
    try {
      const sfds = await sfdApi.getSfdsList();
      setAvailableSfds(sfds);
    } catch (error) {
      console.error('Error loading SFDs:', error);
    } finally {
      setIsLoadingSfds(false);
    }
  };
  
  const handleAddAssociation = async () => {
    if (!selectedSfdId) return;
    
    const success = await associateWithSfd({
      userId,
      sfdId: selectedSfdId,
      makeDefault
    });
    
    if (success) {
      setShowAddDialog(false);
      setSelectedSfdId('');
      setMakeDefault(false);
    }
  };
  
  const handleRemoveAssociation = async (sfdId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette association ?')) {
      await removeAssociation(sfdId);
      fetchUserSfds(userId);
    }
  };
  
  const getUnassociatedSfds = () => {
    const associatedSfdIds = userSfds.map(assoc => assoc.sfds.id);
    return availableSfds.filter(sfd => !associatedSfdIds.includes(sfd.id));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Associations aux SFDs</CardTitle>
        <Button onClick={() => setShowAddDialog(true)} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Associer à une SFD
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : userSfds.length === 0 ? (
          <div className="text-center p-6 bg-muted/20 rounded-md">
            <Building className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              {userName || 'Cet utilisateur'} n'est associé à aucune SFD.
            </p>
          </div>
        ) : (
          <Table>
            <TableCaption>Liste des SFDs associées à {userName || 'cet utilisateur'}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>SFD</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userSfds.map((assoc) => (
                <TableRow key={assoc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {assoc.is_default && (
                        <Badge variant="secondary" className="mr-2">
                          <Check className="w-3 h-3 mr-1" />
                          Par défaut
                        </Badge>
                      )}
                      {assoc.sfds.name}
                    </div>
                  </TableCell>
                  <TableCell>{assoc.sfds.code}</TableCell>
                  <TableCell>{assoc.sfds.region || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={assoc.is_default ? "default" : "outline"}
                    >
                      Admin SFD
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveAssociation(assoc.sfds.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Associer à une SFD</DialogTitle>
              <DialogDescription>
                Sélectionnez une SFD pour l'associer à {userName || 'cet utilisateur'}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="sfd-select">SFD</Label>
                {isLoadingSfds ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : getUnassociatedSfds().length > 0 ? (
                  <Select value={selectedSfdId} onValueChange={setSelectedSfdId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une SFD" />
                    </SelectTrigger>
                    <SelectContent>
                      {getUnassociatedSfds().map((sfd) => (
                        <SelectItem key={sfd.id} value={sfd.id}>
                          {sfd.name} {sfd.code ? `(${sfd.code})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucune SFD disponible pour l'association.
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="make-default" checked={makeDefault} onCheckedChange={setMakeDefault} />
                <Label htmlFor="make-default">Définir comme SFD par défaut</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleAddAssociation} 
                disabled={!selectedSfdId || isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Associer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
