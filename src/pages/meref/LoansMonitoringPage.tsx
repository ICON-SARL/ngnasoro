import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Download, Search, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoansMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sfdFilter, setSfdFilter] = useState<string>('all');

  const { data: loans, isLoading, error } = useQuery({
    queryKey: ['meref-loans-monitoring', statusFilter, sfdFilter],
    queryFn: async () => {
      let query = supabase
        .from('sfd_loans')
        .select(`
          *,
          sfd_clients!client_id (
            full_name,
            client_code,
            sfd_id
          ),
          sfds!sfd_id (
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      if (sfdFilter !== 'all') {
        query = query.eq('sfd_id', sfdFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: sfds } = useQuery({
    queryKey: ['sfds-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredLoans = loans?.filter(loan => {
    const client = loan.sfd_clients as any;
    const sfd = loan.sfds as any;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      client?.full_name?.toLowerCase().includes(searchLower) ||
      client?.client_code?.toLowerCase().includes(searchLower) ||
      sfd?.name?.toLowerCase().includes(searchLower) ||
      loan.amount?.toString().includes(searchTerm)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pending: { variant: 'outline', label: 'En attente' },
      approved: { variant: 'default', label: 'Approuvé' },
      active: { variant: 'default', label: 'Actif' },
      completed: { variant: 'secondary', label: 'Complété' },
      defaulted: { variant: 'destructive', label: 'Défaillant' },
      rejected: { variant: 'destructive', label: 'Rejeté' }
    };

    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = () => {
    // TODO: Implement Excel export
    console.log('Export to Excel');
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des prêts: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supervision des Prêts</h1>
          <p className="text-muted-foreground">
            Vue consolidée de tous les prêts de l'écosystème
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exporter Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres de Recherche</CardTitle>
          <CardDescription>Affinez votre recherche par SFD, statut ou client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par client, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="defaulted">Défaillant</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sfdFilter} onValueChange={setSfdFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les SFDs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les SFDs</SelectItem>
                {sfds?.map(sfd => (
                  <SelectItem key={sfd.id} value={sfd.id}>
                    {sfd.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Prêts ({filteredLoans?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>SFD</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Restant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans?.map((loan) => {
                  const client = loan.sfd_clients as any;
                  const sfd = loan.sfds as any;
                  
                  return (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{client?.client_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{sfd?.name}</TableCell>
                      <TableCell className="font-medium">{formatAmount(loan.amount)}</TableCell>
                      <TableCell>{formatAmount(loan.remaining_amount)}</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>{loan.duration_months} mois</TableCell>
                      <TableCell>{loan.interest_rate}%</TableCell>
                      <TableCell>
                        {new Date(loan.created_at).toLocaleDateString('fr-FR')}
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
