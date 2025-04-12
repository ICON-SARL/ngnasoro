
import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookTransaction {
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
  const [transactions, setTransactions] = useState<WebhookTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState('10');
  const { toast } = useToast();

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Call the edge function to get webhook transactions
      const { data, error } = await supabase.functions.invoke('monitor-webhooks', {
        body: { limit: parseInt(limit) },
      });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching webhook transactions:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de récupérer les transactions: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Monitoring Webhooks</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="limit" className="whitespace-nowrap">Nombre:</Label>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger id="limit" className="w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTransactions} 
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">ID Webhook</th>
                  <th className="px-4 py-2 text-left">Fournisseur</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Référence</th>
                  <th className="px-4 py-2 text-right">Montant</th>
                  <th className="px-4 py-2 text-center">Statut</th>
                  <th className="px-4 py-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      {isLoading ? 'Chargement...' : 'Aucune transaction trouvée'}
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2 font-mono text-xs">{tx.webhook_id}</td>
                      <td className="px-4 py-2">{tx.provider}</td>
                      <td className="px-4 py-2 capitalize">{tx.transaction_type}</td>
                      <td className="px-4 py-2 font-mono text-xs">{tx.reference_id}</td>
                      <td className="px-4 py-2 text-right">{tx.amount.toLocaleString()} FCFA</td>
                      <td className="px-4 py-2 text-center">
                        {tx.status === 'success' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Succès
                          </span>
                        ) : tx.status === 'failed' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <X className="h-3 w-3 mr-1" />
                            Échec
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">{formatDate(tx.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">À propos des Webhooks</h3>
          <p className="text-sm text-muted-foreground">
            Les webhooks permettent à des services externes de notifier notre application d'événements
            en temps réel. Nous utilisons principalement les webhooks pour les paiements via Mobile Money.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted rounded-md">
              <h4 className="font-medium">Logging</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Toutes les tentatives sont stockées dans transaction_audit_logs pour vérification.
              </p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <h4 className="font-medium">Sécurité</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Chaque webhook est vérifié par signature pour garantir son authenticité.
              </p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <h4 className="font-medium">Résolution</h4>
              <p className="text-xs text-muted-foreground mt-1">
                En cas d'échec, des tentatives automatiques sont effectuées toutes les 15 minutes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
