import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CreditsApprovalsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: loanRequests, isLoading } = useQuery({
    queryKey: ['meref-loan-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .select(`
          *,
          sfd:sfds(name, code),
          client:sfd_clients(full_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredRequests = loanRequests?.filter(request => 
    request.sfd?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approbation des Crédits</h1>
        <p className="text-muted-foreground">Examinez et approuvez les demandes de crédit des SFDs</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Demandes de Crédit</CardTitle>
              <CardDescription>
                {filteredRequests?.length || 0} demande(s) trouvée(s)
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
          ) : filteredRequests?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucune demande de crédit trouvée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SFD</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.sfd?.name || 'N/A'}</TableCell>
                    <TableCell>{request.client?.full_name || 'N/A'}</TableCell>
                    <TableCell>{request.amount?.toLocaleString()} FCFA</TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.purpose}</TableCell>
                    <TableCell>
                      {request.created_at 
                        ? format(new Date(request.created_at), 'dd MMM yyyy', { locale: fr })
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status || 'pending')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
