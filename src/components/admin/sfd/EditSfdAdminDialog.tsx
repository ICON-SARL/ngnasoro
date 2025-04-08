
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { SfdAdmin } from '@/components/admin/hooks/sfd-admin/types';

interface EditSfdAdminDialogProps {
  admin: SfdAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    adminId: string;
    role: string;
    has2FA?: boolean;
    is_active?: boolean;
  }) => void;
  isLoading: boolean;
}

export function EditSfdAdminDialog({
  admin,
  open,
  onOpenChange,
  onSave,
  isLoading
}: EditSfdAdminDialogProps) {
  const [role, setRole] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (admin) {
      setRole(admin.role || 'sfd_admin');
      setIsActive(admin.is_active !== false); // Default to true if undefined
    }
  }, [admin]);

  const handleSave = () => {
    if (admin) {
      onSave({
        adminId: admin.id,
        role,
        is_active: isActive
      });
    }
  };

  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'administrateur SFD</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'administrateur SFD
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={admin.email} disabled />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input id="full_name" value={admin.full_name || ''} disabled />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sfd_admin">Administrateur SFD</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Statut</Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="status" 
                checked={isActive} 
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="status">{isActive ? 'Actif' : 'Inactif'}</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
