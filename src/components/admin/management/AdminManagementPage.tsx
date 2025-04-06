
import React, { useState } from 'react';
import { AdminForm } from './AdminForm';
import { AdminTable } from './AdminTable';
import { AdminFilters } from './AdminFilters';
import { AdminEditDialog } from './AdminEditDialog';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { useAdminManagement } from './hooks/useAdminManagement';
import { AdminUser, AdminRole } from './types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';

export function AdminManagementPage() {
  const {
    admins,
    permissions,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    createAdmin,
    updateAdmin,
    toggleAdminStatus,
    resetPassword,
    currentUserRole
  } = useAdminManagement();
  
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsEditDialogOpen(true);
  };
  
  const handleResetPassword = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsResetDialogOpen(true);
  };
  
  // Check if current user can manage admins
  const canManageAdmins = currentUserRole === AdminRole.SUPER_ADMIN;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gestion des Administrateurs</h1>
        <p className="text-sm text-muted-foreground">
          Créez et gérez les comptes administrateurs et leurs permissions
        </p>
      </div>
      
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="space-y-4">
          {/* Create Admin Form (only for super admins) */}
          {canManageAdmins && (
            <Card>
              <CardHeader>
                <CardTitle>Nouveau Compte Administrateur</CardTitle>
                <CardDescription>
                  Créez un nouveau compte avec les permissions appropriées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminForm 
                  onSubmit={createAdmin} 
                  isLoading={isLoading} 
                  error={error} 
                />
              </CardContent>
            </Card>
          )}
          
          {/* Admin List */}
          <Card>
            <CardHeader>
              <CardTitle>Administrateurs</CardTitle>
              <CardDescription>
                Liste des comptes administrateur et leurs rôles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminFilters 
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetFilters}
              />
              
              <AdminTable 
                admins={admins} 
                onToggleStatus={toggleAdminStatus}
                onResetPassword={handleResetPassword}
                onEditAdmin={handleEditAdmin}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          {/* Roles & Permissions Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(permissions).map((role) => {
              const rolePermissions = permissions[role as AdminRole];
              return (
                <Card key={role}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-2">
                        <Shield className="h-4 w-4" />
                      </div>
                      <CardTitle>{role}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${rolePermissions?.can_approve_loans ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Approbation des prêts</span>
                      </li>
                      <li className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${rolePermissions?.can_manage_sfds ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Gestion des SFDs</span>
                      </li>
                      <li className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${rolePermissions?.can_view_reports ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Consultation des rapports</span>
                      </li>
                      <li className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${rolePermissions?.can_manage_admins ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Gestion des administrateurs</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  À propos du contrôle d'accès
                </h3>
                <p className="text-sm">
                  Le système de contrôle d'accès basé sur les rôles (RBAC) garantit que chaque utilisateur 
                  dispose uniquement des permissions nécessaires à l'exercice de ses fonctions.
                  Seuls les super-administrateurs peuvent modifier les permissions des autres utilisateurs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Admin Dialog */}
      <AdminEditDialog 
        admin={selectedAdmin}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={updateAdmin}
        currentUserRole={currentUserRole}
        permissions={selectedAdmin ? permissions[selectedAdmin.role] : null}
        isLoading={isLoading}
      />
      
      {/* Reset Password Dialog */}
      <ResetPasswordDialog 
        admin={selectedAdmin}
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onResetPassword={resetPassword}
        isLoading={isLoading}
      />
    </div>
  );
}
