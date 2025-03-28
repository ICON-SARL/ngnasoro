
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { fetchUsers, UserWithRole } from './utils/roleUtils';
import { UsersList } from './UsersList';
import { AddRoleDialog } from './AddRoleDialog';
import { AccessDenied } from './AccessDenied';

export function RoleManagement() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const usersData = await fetchUsers();
    setUsers(usersData);
    setLoading(false);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user has permission
  if (!hasPermission('manage_users')) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestion des Rôles Utilisateurs</h2>
          <p className="text-sm text-muted-foreground">
            Attribuez des rôles aux utilisateurs du système
          </p>
        </div>
        
        <AddRoleDialog onRoleAssigned={loadUsers} />
      </div>
      
      <UsersList 
        users={filteredUsers}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
      />
    </div>
  );
}
