
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Wallet,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  timestamp: string;
  type: string;
  amount: number;
  status: 'success' | 'pending' | 'failed' | 'flagged';
  client_name: string;
  agency: string;
  details?: string;
}

export const RealTimeTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  
  // Statistiques calculées
  const [stats, setStats] = useState({
    totalCount: 0,
    totalVolume: 0,
    averageAmount: 0,
    alertCount: 0
  });

  // Charger les transactions initiales
  useEffect(() => {
    fetchTransactions();
    
    // Mise en place de la souscription temps réel via Supabase
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, (payload) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSfdId]);
  
  // Effet pour filtrer les transactions lorsque le terme de recherche ou le filtre change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, transactions]);

  // Fonction pour récupérer les transactions
  const fetchTransactions = async () => {
    setIsLoading(true);
    
    try {
      // Simulations de données pour démo
      // En production, remplacer par un appel API réel
      const mockTransactions: Transaction[] = [
        { 
          id: 'TX' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          timestamp: new Date().toISOString(),
          type: 'Versement',
          amount: 250000,
          status: 'success',
          client_name: 'Amadou Diallo',
          agency: 'SFD Bamako Central'
        },
        { 
          id: 'TX' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          type: 'Retrait',
          amount: 75000,
          status: 'success',
          client_name: 'Fatoumata Camara',
          agency: 'SFD Bamako Central'
        },
        { 
          id: 'TX' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          type: 'Transfert',
          amount: 425000,
          status: 'pending',
          client_name: 'Ibrahim Touré',
          agency: 'SFD Ségou Nord'
        },
        { 
          id: 'TX' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
          type: 'Remboursement',
          amount: 50000,
          status: 'success',
          client_name: 'Mariam Sidibé',
          agency: 'SFD Kayes Rural'
        },
        { 
          id: 'TX' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          type: 'Versement',
          amount: 500000,
          status: 'flagged',
          client_name: 'Oumar Konaré',
          agency: 'SFD Sikasso Est',
          details: 'Montant inhabituel pour ce client'
        },
      ];
      
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      calculateStats(mockTransactions);
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
  
  // Gestion des mises à jour en temps réel
  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Convertir le format de la BD vers notre format d'interface
    const formatTransaction = (record: any): Transaction => ({
      id: record.id,
      timestamp: record.date || record.created_at,
      type: record.type,
      amount: record.amount,
      status: record.status || 'success',
      client_name: record.name,
      agency: record.agency || 'SFD Primaire',
      details: record.details
    });
    
    let updatedTransactions = [...transactions];
    
    if (eventType === 'INSERT') {
      updatedTransactions = [formatTransaction(newRecord), ...updatedTransactions];
      toast({
        title: "Nouvelle transaction",
        description: `${newRecord.type} de ${newRecord.amount} FCFA`,
      });
    } else if (eventType === 'UPDATE') {
      updatedTransactions = updatedTransactions.map(tx => 
        tx.id === newRecord.id ? formatTransaction(newRecord) : tx
      );
    } else if (eventType === 'DELETE') {
      updatedTransactions = updatedTransactions.filter(tx => tx.id !== oldRecord.id);
    }
    
    setTransactions(updatedTransactions);
    calculateStats(updatedTransactions);
  };
  
  // Calcul des statistiques
  const calculateStats = (txs: Transaction[]) => {
    const totalCount = txs.length;
    const totalVolume = txs.reduce((sum, tx) => sum + tx.amount, 0);
    const averageAmount = totalCount > 0 ? totalVolume / totalCount : 0;
    const alertCount = txs.filter(tx => tx.status === 'flagged').length;
    
    setStats({
      totalCount,
      totalVolume,
      averageAmount,
      alertCount
    });
  };
  
  // Application des filtres
  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Appliquer la recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.client_name.toLowerCase().includes(term) ||
        tx.id.toLowerCase().includes(term) ||
        tx.agency.toLowerCase().includes(term) ||
        tx.type.toLowerCase().includes(term)
      );
    }
    
    // Appliquer le filtre de statut
    if (statusFilter) {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    
    setFilteredTransactions(filtered);
  };
  
  // Rafraîchir les données
  const handleRefresh = () => {
    fetchTransactions();
    toast({
      title: "Actualisation",
      description: "Les données ont été actualisées",
    });
  };
  
  // Filtrer par statut
  const handleFilterByStatus = (status: string | null) => {
    setStatusFilter(status === statusFilter ? null : status);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Supervision des Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Suivi en temps réel avec mise à jour instantanée
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualiser
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Transactions (24h)</h3>
            <span className="text-green-500">
              <ArrowUp className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalCount}</p>
          <p className="text-xs text-muted-foreground mt-1">+12% vs hier</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Volume (24h)</h3>
            <span className="text-green-500">
              <ArrowUp className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{(stats.totalVolume / 1000000).toFixed(1)}M FCFA</p>
          <p className="text-xs text-muted-foreground mt-1">+5% vs hier</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Moyenne</h3>
            <span className="text-red-500">
              <ArrowDown className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{Math.round(stats.averageAmount).toLocaleString()} FCFA</p>
          <p className="text-xs text-muted-foreground mt-1">-2% vs hier</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Alertes</h3>
            <span className="text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.alertCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Nécessitent une vérification</p>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant={statusFilter === null ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => handleFilterByStatus(null)}
        >
          Tous
        </Button>
        <Button 
          variant={statusFilter === 'success' ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => handleFilterByStatus('success')}
          className="flex items-center"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Succès
        </Button>
        <Button 
          variant={statusFilter === 'pending' ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => handleFilterByStatus('pending')}
          className="flex items-center"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          En attente
        </Button>
        <Button 
          variant={statusFilter === 'failed' ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => handleFilterByStatus('failed')}
          className="flex items-center"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Échec
        </Button>
        <Button 
          variant={statusFilter === 'flagged' ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => handleFilterByStatus('flagged')}
          className="flex items-center"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Signalé
        </Button>
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
                <TableCell colSpan={7} className="text-center py-4">
                  Chargement des transactions...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Aucune transaction trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className={tx.status === 'flagged' ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-7 w-7 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51] mr-2">
                        <Wallet className="h-3.5 w-3.5" />
                      </div>
                      {tx.type}
                    </div>
                  </TableCell>
                  <TableCell>{tx.amount.toLocaleString()} FCFA</TableCell>
                  <TableCell>{tx.client_name}</TableCell>
                  <TableCell>{tx.agency}</TableCell>
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
        <Button variant="outline" size="sm">
          Charger plus de transactions
        </Button>
      </div>
    </div>
  );
};
