
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AdminUser, AdminPermissions, AdminRole } from './types';
import { Switch } from '@/components/ui/switch';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSFDList } from './hooks/useSFDList';

interface AdminEditDialogProps {
  admin: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (admin: AdminUser, permissions: Partial<AdminPermissions>) => Promise<void>;
  currentUserRole: AdminRole;
  permissions: AdminPermissions | null;
  isLoading: boolean;
  error?: string;
}

export const AdminEditDialog: React.FC<AdminEditDialogProps> = ({
  admin,
  isOpen,
  onClose,
  onSave,
  currentUserRole,
  permissions,
  isLoading,
  error
}) => {
  const [editedAdmin, setEditedAdmin] = useState<AdminUser | null>(admin);
  const [editedPermissions, setEditedPermissions] = useState<Partial<AdminPermissions>>({});
  const { sfds } = useSFDList();
  
  // Reset state when admin changes
  useEffect(() => {
    setEditedAdmin(admin);
    setEditedPermissions({});
  }, [admin]);
  
  if (!admin) return null;
  
  const handleChange = (key: keyof AdminUser, value: any) => {
    if (editedAdmin) {
      setEditedAdmin({ ...editedAdmin, [key]: value });
      
      // Reset SFD if role changes from SFD_ADMIN to something else
      if (key === 'role' && value !== AdminRole.SFD_ADMIN) {
        setEditedAdmin(prev => prev ? { ...prev, sfd_id: undefined, sfd_name: undefined } : null);
      }
    }
  };
  
  const handlePermissionChange = (key: keyof AdminPermissions, value: boolean) => {
    setEditedPermissions({ ...editedPermissions, [key]: value });
  };
  
  const handleSave = async () => {
    if (editedAdmin) {
      await onSave(editedAdmin, editedPermissions);
    }
  };
  
  // Determine if current user can edit different fields
  const canEditRole = currentUserRole === AdminRole.SUPER_ADMIN;
  const canEditPermissions = currentUserRole === AdminRole.SUPER_ADMIN;
  const canEditSfd = currentUserRole === AdminRole.SUPER_ADMIN && 
                     editedAdmin.role === AdminRole.SFD_ADMIN;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'administrateur</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm font-medium">{editedAdmin.email}</p>
          </div>
          
          {canEditRole && (
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select 
                value={editedAdmin.role} 
                onValueChange={(value) => handleChange('role', value as AdminRole)}
                disabled={!canEditRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AdminRole.SUPER_ADMIN}>Super Admin</SelectItem>
                  <SelectItem value={AdminRole.SFD_ADMIN}>Administrateur SFD</SelectItem>
                  <SelectItem value={AdminRole.SUPPORT}>Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {canEditSfd && (
            <div className="space-y-2">
              <Label htmlFor="sfd">SFD Associée</Label>
              <Select 
                value={editedAdmin.sfd_id} 
                onValueChange={(value) => handleChange('sfd_id', value)}
                disabled={!canEditSfd}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une SFD" />
                </SelectTrigger>
                <SelectContent>
                  {sfds.map(sfd => (
                    <SelectItem key={sfd.id} value={sfd.id}>{sfd.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <div className="flex items-center">
              <Switch 
                checked={editedAdmin.is_active} 
                onCheckedChange={(checked) => handleChange('is_active', checked)}
                id="status"
              />
              <span className="ml-2">{editedAdmin.is_active ? 'Actif' : 'Inactif'}</span>
            </div>
          </div>
          
          {canEditPermissions && permissions && (
            <>
              <div className="border-t mt-4 pt-4">
                <h3 className="font-medium mb-2">Permissions</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_approve_loans" className="cursor-pointer">
                      Approbation des prêts
                    </Label>
                    <Switch 
                      id="can_approve_loans"
                      checked={editedPermissions.can_approve_loans !== undefined 
                        ? editedPermissions.can_approve_loans 
                        : permissions.can_approve_loans}
                      onCheckedChange={(checked) => handlePermissionChange('can_approve_loans', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_manage_sfds" className="cursor-pointer">
                      Gestion des SFDs
                    </Label>
                    <Switch 
                      id="can_manage_sfds"
                      checked={editedPermissions.can_manage_sfds !== undefined 
                        ? editedPermissions.can_manage_sfds 
                        : permissions.can_manage_sfds}
                      onCheckedChange={(checked) => handlePermissionChange('can_manage_sfds', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="can_view_reports" className="cursor-pointer">
                      Consultation des rapports
                    </Label>
                    <Switch 
                      id="can_view_reports"
                      checked={editedPermissions.can_view_reports !== undefined 
                        ? editedPermissions.can_view_reports 
                        : permissions.can_view_reports}
                      onCheckedChange={(checked) => handlePermissionChange('can_view_reports', checked)}
                    />
                  </div>
                  
                  {editedAdmin.role === AdminRole.SUPER_ADMIN && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="can_manage_admins" className="cursor-pointer">
                        Gestion des administrateurs
                      </Label>
                      <Switch 
                        id="can_manage_admins"
                        checked={editedPermissions.can_manage_admins !== undefined 
                          ? editedPermissions.can_manage_admins 
                          : permissions.can_manage_admins}
                        onCheckedChange={(checked) => handlePermissionChange('can_manage_admins', checked)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
