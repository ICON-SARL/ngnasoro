import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Smartphone, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MobileMoneyMonitoringPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: transactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ['meref-mobile-money-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          account:accounts(user_id)
        `)
        .eq('payment_method', 'mobile_money')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['mobile-money-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobile_money_settings')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredTransactions = transactions?.filter(tx => 
    tx.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Réussie</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Échouée</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOperatorBadge = (operator: string | null) => {
    switch (operator) {
      case 'orange_money':
        return <Badge className="bg-orange-100 text-orange-800">Orange Money</Badge>;
      case 'mtn_money':
        return <Badge className="bg-yellow-100 text-yellow-800">MTN Money</Badge>;
      case 'moov_money':
        return <Badge className="bg-blue-100 text-blue-800">Moov Money</Badge>;
      default:
        return <Badge variant="secondary">{operator}</Badge>;
    }
  };

  const totalAmount = transactions?.filter(tx => tx.status === 'completed')
    .reduce((acc, tx) => acc + (tx.amount || 0), 0) || 0;
  const successRate = transactions?.length 
    ? (transactions.filter(tx => tx.status === 'completed').length / transactions.length * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Smartphone className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Supervision Mobile Money</h1>
          <p className="text-muted-foreground">Surveillez les transactions Mobile Money de toutes les SFDs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{transactions?.length || 0}</p>
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
                <p className="text-sm text-muted-foreground">Taux de succès</p>
                <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Smartphone className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume Total</p>
                <p className="text-2xl font-bold">{totalAmount.toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opérateurs Actifs</p>
                <p className="text-2xl font-bold">{settings?.filter(s => s.is_active).length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Configuration Opérateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Transactions Mobile Money</CardTitle>
                  <CardDescription>
                    {filteredTransactions?.length || 0} transaction(s) récente(s)
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par référence..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredTransactions?.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Aucune transaction trouvée
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Opérateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions?.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">{tx.reference || 'N/A'}</TableCell>
                        <TableCell>{getOperatorBadge(tx.payment_method)}</TableCell>
                        <TableCell className="capitalize">{tx.type}</TableCell>
                        <TableCell>{tx.amount?.toLocaleString()} FCFA</TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell>
                          {tx.created_at 
                            ? format(new Date(tx.created_at), 'dd MMM yyyy HH:mm', { locale: fr })
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des Opérateurs</CardTitle>
              <CardDescription>Statut des intégrations Mobile Money</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {settings?.map((setting) => (
                    <Card key={setting.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium capitalize">{setting.operator.replace('_', ' ')}</p>
                              <p className="text-sm text-muted-foreground">
                                {setting.is_active ? 'Configuré' : 'Non configuré'}
                              </p>
                            </div>
                          </div>
                          {setting.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Actif</Badge>
                          ) : (
                            <Badge variant="secondary">Inactif</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
