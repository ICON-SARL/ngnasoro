
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserCog, 
  ShieldCheck, 
  Users, 
  Plus, 
  Search, 
  Check, 
  Mail,
  Loader2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/hooks/auth/types';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export function RoleManagement() {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [assigningRole, setAssigningRole] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de charger les utilisateurs",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!email) {
      toast({
        title: 'Erreur',
        description: "L'adresse email est requise",
        variant: 'destructive',
      });
      return;
    }

    setAssigningRole(true);
    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        // User not found in admin_users table, look in auth.users (administrators only)
        const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1,
          filter: {
            email: email
          }
        });

        if (authError || !authUsersData?.users?.length) {
          throw new Error('Utilisateur non trouvé');
        }

        const authUser = authUsersData.users[0];

        // Update user's role in app_metadata
        const { error: updateError } = await supabase
          .auth.admin.updateUserById(authUser.id, {
            app_metadata: { role: selectedRole }
          });

        if (updateError) throw updateError;

        // Create or update record in admin_users table
        const { error: adminError } = await supabase
          .from('admin_users')
          .upsert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata.full_name || email.split('@')[0],
            role: selectedRole
          });

        if (adminError) throw adminError;
      } else {
        // User found in admin_users, update their role
        const userId = userData.id;

        // Update user's role in app_metadata
        const { error: updateError } = await supabase
          .auth.admin.updateUserById(userId, {
            app_metadata: { role: selectedRole }
          });

        if (updateError) throw updateError;

        // Update record in admin_users table
        const { error: adminError } = await supabase
          .from('admin_users')
          .update({ role: selectedRole })
          .eq('id', userId);

        if (adminError) throw adminError;
      }

      // Call the assign_role function for both cases
      const { error: roleError } = await supabase.rpc('assign_role', {
        user_id: userData?.id || authUsersData?.users[0].id,
        role: selectedRole
      });

      if (roleError) throw roleError;

      toast({
        title: 'Rôle attribué',
        description: `Le rôle ${selectedRole} a été attribué à ${email}`,
      });

      setShowAddDialog(false);
      setEmail('');
      setSelectedRole('user');
      fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Erreur',
        description: error.message || "Impossible d'attribuer le rôle",
        variant: 'destructive',
      });
    } finally {
      setAssigningRole(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user has permission
  if (!hasPermission('manage_users')) {
    return (
      <div className="p-6 text-center">
        <ShieldCheck className="h-12 w-12 text-amber-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
        <p className="text-gray-600">
          Vous n'avez pas les permissions nécessaires pour gérer les rôles utilisateurs.
        </p>
      </div>
    );
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
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Attribuer un Rôle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attribuer un rôle à un utilisateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="email" 
                    placeholder="utilisateur@exemple.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={selectedRole === 'user' ? 'default' : 'outline'}
                    onClick={() => setSelectedRole('user')}
                    className="justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Utilisateur
                  </Button>
                  <Button
                    type="button"
                    variant={selectedRole === 'sfd_admin' ? 'default' : 'outline'}
                    onClick={() => setSelectedRole('sfd_admin')}
                    className="justify-start"
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Admin SFD
                  </Button>
                  <Button
                    type="button"
                    variant={selectedRole === 'admin' ? 'default' : 'outline'}
                    onClick={() => setSelectedRole('admin')}
                    className="justify-start"
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Super Admin
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAssignRole}
                disabled={assigningRole}
              >
                {assigningRole ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Attribution...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Attribuer le rôle
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-md border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher un utilisateur..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#0D6A51]" />
              <p className="mt-2 text-gray-600">Chargement des utilisateurs...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white
                    ${user.role === 'admin' 
                      ? 'bg-amber-600' 
                      : user.role === 'sfd_admin' 
                      ? 'bg-blue-600' 
                      : 'bg-[#0D6A51]'}`
                  }>
                    {user.role === 'admin' ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : user.role === 'sfd_admin' ? (
                      <UserCog className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">{user.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge className={
                  user.role === 'admin' 
                    ? 'bg-amber-100 text-amber-800' 
                    : user.role === 'sfd_admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }>
                  {user.role === 'admin' ? 'Super Admin' : 
                   user.role === 'sfd_admin' ? 'Admin SFD' : 'Utilisateur'}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
