import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, XCircle, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ApprovalsHistoryPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const { data: approvalHistory, isLoading } = useQuery({
    queryKey: ['meref-approval-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfd_approval_history')
        .select(`
          *,
          sfd:sfds(name, code)
        `)
        .order('reviewed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredHistory = approvalHistory?.filter(item => {
    const matchesSearch = item.sfd?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.comments?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.action === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Historique des Approbations</h1>
          <p className="text-muted-foreground">Consultez l'historique des décisions d'approbation</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Historique</CardTitle>
              <CardDescription>
                {filteredHistory?.length || 0} entrée(s) trouvée(s)
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
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
          ) : filteredHistory?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucune entrée trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SFD</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Commentaires</TableHead>
                  <TableHead>Date de décision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sfd?.name || 'N/A'}</TableCell>
                    <TableCell>{getActionBadge(item.action)}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{item.comments || '-'}</TableCell>
                    <TableCell>
                      {item.reviewed_at 
                        ? format(new Date(item.reviewed_at), 'dd MMM yyyy à HH:mm', { locale: fr })
                        : 'N/A'}
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
