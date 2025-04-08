
import React from 'react';
import { UserList } from './UserList';
import { UserFilters } from './UserFilters';
import { AddUserDialog } from './AddUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { DeleteUserDialog } from './DeleteUserDialog';
import { useSfdUserManagement } from './hooks/useSfdUserManagement';

export function SfdUserManagement() {
  const {
    users,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    kycFilter,
    setKycFilter,
    isNewUserModalOpen,
    setIsNewUserModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedUser,
    handleEditUser,
    handleDeleteUser,
    confirmDeactivation,
    exportUserData,
    isLoading
  } = useSfdUserManagement();

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <AddUserDialog 
          isOpen={isNewUserModalOpen}
          onOpenChange={setIsNewUserModalOpen}
        />
      </div>
      
      {/* Filters and search */}
      <UserFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        kycFilter={kycFilter}
        setKycFilter={setKycFilter}
        exportUserData={exportUserData}
      />
      
      {/* User List */}
      <UserList 
        users={filteredUsers}
        isLoading={isLoading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      
      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      )}
      
      {/* Delete (Deactivate) Confirmation Modal */}
      <DeleteUserDialog 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeactivation}
      />
    </div>
  );
}
