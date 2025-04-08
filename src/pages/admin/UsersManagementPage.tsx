
import React, { useState, useEffect } from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { adminApi } from '@/utils/api/modules/adminApi';
import { UserDetails } from '@/components/admin/UserDetails';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, UserIcon, Shield, UserPlus, Loader2 } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<any | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetails(selectedUserId);
    } else {
      setSelectedUserData(null);
    }
  }, [selectedUserId]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error) throw error;
      
      setSelectedUserData(data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSelectedUserData(null);
    }
  };
  
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.user_metadata?.full_name?.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });
  
  const getUserRole = (user: any) => {
    return user.app_metadata?.role || 'user';
  };
  
  const handleUserRowClick = (userId: string) => {
    setSelectedUserId(userId === selectedUserId ? null : userId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Administrez les utilisateurs et leurs associations aux SFDs
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`bg-white p-6 rounded-lg shadow border border-gray-100 ${selectedUserId ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Liste des Utilisateurs</h2>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom, email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-8 bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow 
                        key={user.id} 
                        className={`cursor-pointer ${selectedUserId === user.id ? 'bg-muted' : ''}`}
                        onClick={() => handleUserRowClick(user.id)}
                      >
                        <TableCell className="font-medium">
                          {user.user_metadata?.full_name || 'Utilisateur'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              getUserRole(user) === 'admin' 
                                ? 'destructive' 
                                : getUserRole(user) === 'sfd_admin' 
                                ? 'default' 
                                : 'secondary'
                            }
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {getUserRole(user) === 'admin' 
                              ? 'Admin' 
                              : getUserRole(user) === 'sfd_admin' 
                              ? 'Admin SFD' 
                              : 'Utilisateur'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          {selectedUserId && (
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-100">
              <UserDetails 
                userId={selectedUserId} 
                userData={selectedUserData} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
