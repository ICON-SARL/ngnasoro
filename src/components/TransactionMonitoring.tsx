
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RefreshCw, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/transactions';
import { transactionService } from '@/services/transactions/transactionService';
import { transactionStatisticsService } from '@/services/transactions/transactionStatisticsService';

export const TransactionMonitoring = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  
  // Statistics
  const [stats, setStats] = useState({
    totalCount: 0,
    totalVolume: 0,
    averageAmount: 0,
    flaggedCount: 0,
    compareYesterday: {
      countChange: 12, // Default values for comparison
      volumeChange: 5,
      averageChange: -2
    }
  });

  // Load transactions and statistics
  useEffect(() => {
    fetchTransactions();
    
    // Set up a refresh interval (every 60 seconds)
    const refreshInterval = setInterval(() => {
      fetchTransactions(false); // silent refresh
    }, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [user, activeSfdId]);
  
  // Handle search filtering
  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  const fetchTransactions = async (showToast = true) => {
    if (!user?.id || !activeSfdId) return;
    
    setIsLoading(true);
    
    try {
      // Get transactions
      const txData = await transactionService.getUserTransactions(user.id, activeSfdId, {
        limit: 20,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
      });
      
      // Get statistics
      const statsData = await transactionStatisticsService.generateTransactionStatistics(
        user.id,
        activeSfdId,
        'day' // 24-hour period
      );
      
      setTransactions(txData);
      setFilteredTransactions(txData);
      
      // Calculate flag count
      const flaggedCount = txData.filter(tx => tx.status === 'flagged').length;
      
      setStats({
        totalCount: txData.length,
        totalVolume: statsData.totalVolume,
        averageAmount: statsData.averageAmount,
        flaggedCount: flaggedCount,
        compareYesterday: {
          countChange: 12, // These would come from a real comparison service
          volumeChange: 5,
          averageChange: -2
        }
      });
      
      if (showToast) {
        toast({
          title: "Données actualisées",
          description: `${txData.length} transactions chargées avec succès.`
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des transactions:", error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les transactions. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
  };
  
  // Format currency with FCFA
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' FCFA';
  };
  
  // Format date in a localized way
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Monitoring des Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Suivi en temps réel avec l'infrastructure ElasticSearch
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtres
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Transactions (24h)</h3>
            <span className={stats.compareYesterday.countChange >= 0 ? "text-green-500" : "text-red-500"}>
              {stats.compareYesterday.countChange >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalCount || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.compareYesterday.countChange >= 0 ? '+' : ''}
            {stats.compareYesterday.countChange}% vs hier
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Volume (24h)</h3>
            <span className={stats.compareYesterday.volumeChange >= 0 ? "text-green-500" : "text-red-500"}>
              {stats.compareYesterday.volumeChange >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {(stats.totalVolume / 1000000).toFixed(1)}M FCFA
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.compareYesterday.volumeChange >= 0 ? '+' : ''}
            {stats.compareYesterday.volumeChange}% vs hier
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Moyenne</h3>
            <span className={stats.compareYesterday.averageChange >= 0 ? "text-green-500" : "text-red-500"}>
              {stats.compareYesterday.averageChange >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {Math.round(stats.averageAmount).toLocaleString()} FCFA
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.compareYesterday.averageChange >= 0 ? '+' : ''}
            {stats.compareYesterday.averageChange}% vs hier
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Alertes</h3>
            <span className="text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.flaggedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Nécessitent une vérification</p>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Transaction</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Agence</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <p className="mt-2">Chargement des transactions...</p>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Aucune transaction trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className={tx.status === 'flagged' ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">{tx.id.substring(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{formatDate(tx.created_at)}</TableCell>
                  <TableCell>
                    {tx.type === 'deposit' ? 'Versement' : 
                     tx.type === 'withdrawal' ? 'Retrait' : 
                     tx.type === 'transfer' ? 'Transfert' :
                     tx.type === 'payment' ? 'Paiement' :
                     tx.type === 'loan_disbursement' ? 'Décaissement' :
                     tx.type === 'loan_repayment' ? 'Remboursement' : 
                     tx.type}
                  </TableCell>
                  <TableCell>{formatCurrency(tx.amount)}</TableCell>
                  <TableCell>{tx.name || 'Client inconnu'}</TableCell>
                  <TableCell>{tx.metadata?.agency || 'SFD Principale'}</TableCell>
                  <TableCell>
                    {tx.status === 'success' && (
                      <Badge className="bg-green-100 text-green-700">Succès</Badge>
                    )}
                    {tx.status === 'pending' && (
                      <Badge className="bg-amber-100 text-amber-700">En attente</Badge>
                    )}
                    {tx.status === 'failed' && (
                      <Badge className="bg-red-100 text-red-700">Échec</Badge>
                    )}
                    {tx.status === 'flagged' && (
                      <Badge className="bg-red-100 text-red-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Suspect
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-center mt-4">
        <Button variant="outline" size="sm" onClick={() => fetchTransactions()}>
          Charger plus de transactions
        </Button>
      </div>
    </div>
  );
};
