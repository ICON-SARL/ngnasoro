import React from 'react';
import { RoleCard } from './RoleCard';
import { NewRoleDialog } from './NewRoleDialog';
import { useRoleManager } from './useRoleManager';
import { Button } from '@/components/ui/button';
import { Shield, Plus, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function AdminRoleManager() {
  const {
    roles,
    permissions,
    showNewRoleDialog,
    setShowNewRoleDialog,
    newRole,
    setNewRole,
    handleTogglePermission,
    handleSaveNewRole,
    handleDeleteRole,
    handleEditRole,
    isEditMode,
    setIsEditMode
  } = useRoleManager();

  const syncRolesToDatabase = async () => {
    try {
      toast({
        title: "Synchronisation",
        description: "Synchronisation des rôles avec la base de données...",
      });
      
      // Call the sync function endpoint
      const { data, error } = await supabase.functions.invoke('admin-mobile-sync', {
        body: JSON.stringify({ 
          endpoint: '/sfds',
          forceSync: true
        }),
      });
      
      if (error) throw error;
      
      // Log activity in audit logs
      await logAuditEvent({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'sync_roles',
        category: AuditLogCategory.ADMIN_ACTION,
        severity: AuditLogSeverity.INFO,
        details: { timestamp: new Date().toISOString() },
        status: 'success'
      });
      
      toast({
        title: "Synchronisation réussie",
        description: "Tous les rôles ont été synchronisés avec succès",
      });
    } catch (error) {
      console.error('Error syncing roles:', error);
      
      // Log the error
      await logAuditEvent({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'sync_roles',
        category: AuditLogCategory.ADMIN_ACTION,
        severity: AuditLogSeverity.ERROR,
        details: { error: error.message },
        status: 'failure',
        error_message: error.message
      });
      
      toast({
        title: "Erreur de synchronisation",
        description: "Une erreur est survenue lors de la synchronisation des rôles",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestion des Rôles Administratifs</h2>
          <p className="text-sm text-muted-foreground">
            Définissez les différents rôles administratifs et leurs permissions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncRolesToDatabase}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Synchroniser
          </Button>
          <Button onClick={() => setShowNewRoleDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Rôle
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map(role => (
          <RoleCard 
            key={role.id} 
            role={role} 
            permissions={permissions}
            onEdit={() => handleEditRole(role)}
            onDelete={() => handleDeleteRole(role.id)}
          />
        ))}
      </div>
      
      <NewRoleDialog
        isOpen={showNewRoleDialog}
        onOpenChange={setShowNewRoleDialog}
        newRole={newRole}
        permissions={permissions}
        onNameChange={(name) => setNewRole({ ...newRole, name })}
        onDescriptionChange={(description) => setNewRole({ ...newRole, description })}
        onTogglePermission={handleTogglePermission}
        onSave={handleSaveNewRole}
        isEditMode={isEditMode}
      />
    </div>
  );
}
