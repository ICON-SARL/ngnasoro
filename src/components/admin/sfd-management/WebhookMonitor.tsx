
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: string;
  webhook_id: string;
  provider: string;
  status: string;
  amount: number;
  reference_id: string;
  created_at: string;
  transaction_type: string;
}

export function WebhookMonitor() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactionLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This would call an edge function in production
      const { data, error } = await supabase.functions.invoke('monitor-webhooks', {
        body: { limit: 10 }
      });
      
      if (error) throw error;
      
      if (data) {
        setTransactions(data);
      } else {
        // Fallback mock data
        setTransactions([
          {
            id: '1',
            webhook_id: 'wh_123',
            provider: 'Mobile Money',
            status: 'success',
            amount: 25000,
            reference_id: 'tx_456',
            created_at: new Date().toISOString(),
            transaction_type: 'payment'
          },
          {
            id: '2',
            webhook_id: 'wh_124',
            provider: 'Mobile Money',
            status: 'failed',
            amount: 15000,
            reference_id: 'tx_457',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            transaction_type: 'transfer'
          }
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching transaction logs:', err);
      setError(err.message || 'Failed to fetch transaction logs');
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les logs de transaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionLogs();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Monitoring des Webhooks
          </CardTitle>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchTransactionLogs}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4 text-red-800 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Aucune transaction récente</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(tx.created_at), 'dd/MM/yyyy')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistance(new Date(tx.created_at), new Date(), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{tx.provider}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {tx.transaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {tx.amount.toLocaleString()} FCFA
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {tx.reference_id}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={tx.status === 'success' ? 'default' : 'destructive'}
                      className={tx.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {tx.status === 'success' ? 'Succès' : 'Échec'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <div className="mt-4 text-sm text-gray-500 flex items-center">
          <ExternalLink className="h-4 w-4 mr-1" />
          <span>Configuration recommandée: utiliser Sentry ou Datadog pour l'analyse avancée.</span>
        </div>
      </CardContent>
    </Card>
  );
}
