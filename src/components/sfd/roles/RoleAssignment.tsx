
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useRoleAssignment } from '@/hooks/useRoleAssignment';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, UserCheck, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserRole } from '@/hooks/auth/types';

interface RoleAssignmentProps {
  userId: string;
  userName: string;
  currentRole?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RoleAssignment({ 
  userId, 
  userName, 
  currentRole,
  open, 
  onOpenChange,
  onSuccess
}: RoleAssignmentProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole || UserRole.USER);
  const [isSaving, setIsSaving] = useState(false);
  const { user, isAdmin } = useAuth();
  const { assignRole, availableRoles, isLoading } = useRoleAssignment();
  
  useEffect(() => {
    if (currentRole) {
      setSelectedRole(currentRole);
    }
  }, [currentRole, open]);
  
  const handleAssignRole = async () => {
    if (!userId || !selectedRole) return;
    
    setIsSaving(true);
    try {
      await assignRole.mutateAsync({
        userId,
        role: selectedRole as UserRole
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning role:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Attribution de Rôle</DialogTitle>
          <DialogDescription>
            Attribuez un rôle à {userName} pour définir ses permissions dans le système.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!isAdmin && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Permission limitée</AlertTitle>
              <AlertDescription>
                En tant qu'administrateur SFD, vous ne pouvez attribuer que des rôles spécifiques à votre SFD.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{userName}</p>
              {currentRole && (
                <Badge variant="outline" className="mt-1">
                  Rôle actuel: {currentRole}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Sélectionnez un rôle
            </label>
            <Select 
              value={selectedRole} 
              onValueChange={setSelectedRole}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Les attributions de rôle définissent les fonctionnalités accessibles à l'utilisateur.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssignRole} 
            disabled={isSaving || isLoading || selectedRole === currentRole}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {isSaving ? 'Enregistrement...' : 'Attribuer le rôle'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
