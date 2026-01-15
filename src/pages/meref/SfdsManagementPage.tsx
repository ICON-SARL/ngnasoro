import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Building2, Eye, Edit, Users, Banknote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SfdsManagementPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: sfds, isLoading } = useQuery({
    queryKey: ['meref-sfds-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select(`
          *,
          stats:sfd_stats(total_clients, active_loans, total_disbursed)
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredSfds = sfds?.filter(sfd => 
    sfd.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sfd.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sfd.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gestion des SFDs</h1>
          <p className="text-muted-foreground">Gérez les Structures de Financement Décentralisé</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total SFDs</p>
                <p className="text-2xl font-bold">{sfds?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SFDs Actifs</p>
                <p className="text-2xl font-bold">{sfds?.filter(s => s.status === 'active').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Banknote className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subventions</p>
                <p className="text-2xl font-bold">
                  {sfds?.reduce((acc, sfd) => acc + (sfd.subsidy_balance || 0), 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Liste des SFDs</CardTitle>
              <CardDescription>
                {filteredSfds?.length || 0} SFD(s) trouvé(s)
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
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
          ) : filteredSfds?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucune SFD trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>Prêts Actifs</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSfds?.map((sfd) => (
                  <TableRow key={sfd.id}>
                    <TableCell className="font-medium">{sfd.name}</TableCell>
                    <TableCell>{sfd.code}</TableCell>
                    <TableCell>{sfd.region || 'N/A'}</TableCell>
                    <TableCell>{sfd.stats?.[0]?.total_clients || 0}</TableCell>
                    <TableCell>{sfd.stats?.[0]?.active_loans || 0}</TableCell>
                    <TableCell>{getStatusBadge(sfd.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
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
