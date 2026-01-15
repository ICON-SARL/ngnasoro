import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, Coins, TrendingUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';

export default function TontinesMonitoringPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: tontines, isLoading } = useQuery({
    queryKey: ['meref-tontines-monitoring'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborative_vaults')
        .select(`
          *,
          sfd:sfds(name),
          members:collaborative_vault_members(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredTontines = tontines?.filter(tontine => 
    tontine.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tontine.sfd?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Terminée</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status || 'N/A'}</Badge>;
    }
  };

  const totalAmount = tontines?.reduce((acc, t) => acc + (t.current_amount || 0), 0) || 0;
  const totalMembers = tontines?.reduce((acc, t) => acc + (t.member_count || 0), 0) || 0;
  const activeTontines = tontines?.filter(t => t.status === 'active').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Supervision des Tontines</h1>
          <p className="text-muted-foreground">Surveillez les coffres collaboratifs de toutes les SFDs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tontines</p>
                <p className="text-2xl font-bold">{tontines?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tontines Actives</p>
                <p className="text-2xl font-bold">{activeTontines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Membres</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Coins className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant Total</p>
                <p className="text-2xl font-bold">{totalAmount.toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Liste des Tontines</CardTitle>
              <CardDescription>
                {filteredTontines?.length || 0} tontine(s) trouvée(s)
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
          ) : filteredTontines?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucune tontine trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>SFD</TableHead>
                  <TableHead>Membres</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Échéance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTontines?.map((tontine) => {
                  const progress = tontine.target_amount > 0 
                    ? ((tontine.current_amount || 0) / tontine.target_amount) * 100 
                    : 0;
                  return (
                    <TableRow key={tontine.id}>
                      <TableCell className="font-medium">{tontine.name}</TableCell>
                      <TableCell>{tontine.sfd?.name || 'N/A'}</TableCell>
                      <TableCell>{tontine.member_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(tontine.status)}</TableCell>
                      <TableCell>
                        {tontine.deadline 
                          ? format(new Date(tontine.deadline), 'dd MMM yyyy', { locale: fr })
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
