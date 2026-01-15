import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, Eye, Shield, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['meref-all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch roles separately
      const userIds = data?.map(u => u.id) || [];
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);
      
      return data?.map(user => ({
        ...user,
        userRole: roles?.find(r => r.user_id === user.id)?.role || 'user'
      }));
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'sfd_admin':
        return <Badge className="bg-blue-100 text-blue-800">Admin SFD</Badge>;
      case 'client':
        return <Badge className="bg-green-100 text-green-800"><UserCheck className="h-3 w-3 mr-1" />Client</Badge>;
      default:
        return <Badge variant="secondary">Utilisateur</Badge>;
    }
  };

  const getKycBadge = (level: number | null) => {
    switch (level) {
      case 3:
        return <Badge className="bg-green-100 text-green-800">Niveau 3</Badge>;
      case 2:
        return <Badge className="bg-blue-100 text-blue-800">Niveau 2</Badge>;
      case 1:
        return <Badge variant="secondary">Niveau 1</Badge>;
      default:
        return <Badge variant="outline">Non vérifié</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Consultez tous les utilisateurs du système</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{users?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {users?.filter(u => u.userRole === 'client').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {users?.filter(u => u.userRole === 'sfd_admin').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Admins SFD</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {users?.filter(u => u.userRole === 'admin').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Admins MEREF</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Liste des Utilisateurs</CardTitle>
              <CardDescription>
                {filteredUsers?.length || 0} utilisateur(s) trouvé(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sfd_admin">Admin SFD</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredUsers?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucun utilisateur trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Niveau KYC</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{getRoleBadge(user.userRole)}</TableCell>
                    <TableCell>{getKycBadge(user.kyc_level)}</TableCell>
                    <TableCell>
                      {user.created_at 
                        ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
