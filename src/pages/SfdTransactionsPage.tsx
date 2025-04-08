
import React, { useState, useEffect } from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  FileText,
  Calendar
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Transaction } from '@/types/transactions';

type TransactionType = 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'transfer';

const SfdTransactionsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [openNewTransactionDialog, setOpenNewTransactionDialog] = useState(false);
  
  // Mock data for demonstration
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      user_id: '101',
      amount: 150000,
      type: 'deposit',
      status: 'success',
      created_at: '2023-06-15T10:30:00Z',
      name: 'Dépôt client',
      description: 'Dépôt en espèces par Aminata Diallo',
      sfd_id: user?.sfd_id || '',
    },
    {
      id: '2',
      user_id: '102',
      amount: 75000,
      type: 'withdrawal',
      status: 'success',
      created_at: '2023-06-14T14:45:00Z',
      name: 'Retrait client',
      description: 'Retrait en espèces par Ousmane Ndiaye',
      sfd_id: user?.sfd_id || '',
    },
    {
      id: '3',
      user_id: '103',
      amount: 500000,
      type: 'loan_disbursement',
      status: 'success',
      created_at: '2023-06-10T09:15:00Z',
      name: 'Décaissement de prêt',
      description: 'Décaissement du prêt #LN1082 pour Fatou Sow',
      sfd_id: user?.sfd_id || '',
    },
    {
      id: '4',
      user_id: '103',
      amount: 45000,
      type: 'loan_repayment',
      status: 'success',
      created_at: '2023-06-05T11:20:00Z',
      name: 'Remboursement de prêt',
      description: 'Remboursement mensuel du prêt #LN1082 par Fatou Sow',
      sfd_id: user?.sfd_id || '',
    },
    {
      id: '5',
      user_id: '104',
      amount: 100000,
      type: 'transfer',
      status: 'success',
      created_at: '2023-06-03T16:30:00Z',
      name: 'Transfert entre comptes',
      description: 'Transfert du compte épargne vers compte courant de Ibrahim Diop',
      sfd_id: user?.sfd_id || '',
    }
  ];
  
  // Load transactions on component mount
  useEffect(() => {
    // In a real application, this would fetch from an API
    setTimeout(() => {
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setLoading(false);
    }, 800);
  }, []);
  
  // Apply filters when any filter changes
  useEffect(() => {
    let filtered = transactions;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(transaction => 
        transaction.name.toLowerCase().includes(term) ||
        transaction.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by transaction type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }
    
    // Filter by date range
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.created_at);
        return transactionDate >= fromDate;
      });
    }
    
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.created_at);
        return transactionDate <= toDate;
      });
    }
    
    setFilteredTransactions(filtered);
  }, [searchTerm, typeFilter, dateRange, transactions]);
  
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };
  
  const handleExportTransactions = (format) => {
    toast({
      title: 'Export lancé',
      description: `Les transactions sont en cours d'export au format ${format.toUpperCase()}`
    });
    setOpenExportDialog(false);
    
    // In a real application, this would trigger an actual export
    setTimeout(() => {
      toast({
        title: 'Export terminé',
        description: `Les transactions ont été exportées avec succès`
      });
    }, 2000);
  };
  
  const handleNewTransaction = (type) => {
    toast({
      title: 'Nouvelle transaction',
      description: `L'interface pour créer une transaction de type ${type} sera disponible prochainement`
    });
    setOpenNewTransactionDialog(false);
  };
  
  const getTransactionTypeLabel = (type: string) => {
    switch(type) {
      case 'deposit': return 'Dépôt';
      case 'withdrawal': return 'Retrait';
      case 'loan_disbursement': return 'Décaissement';
      case 'loan_repayment': return 'Remboursement';
      case 'transfer': return 'Transfert';
      default: return type;
    }
  };
  
  const getTransactionTypeIcon = (type: string) => {
    switch(type) {
      case 'deposit':
      case 'loan_repayment':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
      case 'loan_disbursement':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };
  
  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Transactions SFD</h1>
            <p className="text-muted-foreground">Gérez et suivez toutes les transactions de votre SFD</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            
            <Button onClick={() => setOpenNewTransactionDialog(true)}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Nouvelle Transaction
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Filtres</CardTitle>
            <CardDescription>
              Filtrez les transactions par type, date ou recherchez par description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex-1 max-w-xs">
                <Select 
                  value={typeFilter} 
                  onValueChange={(value) => setTypeFilter(value as TransactionType | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type de transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="deposit">Dépôts</SelectItem>
                    <SelectItem value="withdrawal">Retraits</SelectItem>
                    <SelectItem value="loan_disbursement">Décaissements</SelectItem>
                    <SelectItem value="loan_repayment">Remboursements</SelectItem>
                    <SelectItem value="transfer">Transferts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'dd/MM/yyyy', {locale: fr})} -{' '}
                          {format(dateRange.to, 'dd/MM/yyyy', {locale: fr})}
                        </>
                      ) : (
                        format(dateRange.from, 'dd/MM/yyyy', {locale: fr})
                      )
                    ) : (
                      <span>Sélectionner une période</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <DatePickerWithRange 
                    date={dateRange} 
                    setDate={handleDateRangeChange} 
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Historique des transactions</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Chargement des transactions...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Aucune transaction trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {getFormattedDate(transaction.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getTransactionTypeIcon(transaction.type)}
                            <span className="ml-2">
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{transaction.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.type === 'deposit' || transaction.type === 'loan_repayment' 
                            ? 'text-green-600' 
                            : transaction.type === 'withdrawal' || transaction.type === 'loan_disbursement'
                              ? 'text-red-600' 
                              : ''
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'loan_repayment' 
                            ? '+' 
                            : transaction.type === 'withdrawal' || transaction.type === 'loan_disbursement'
                              ? '-' 
                              : ''}
                          {transaction.amount.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          {transaction.status === 'success' && (
                            <Badge className="bg-green-100 text-green-800">Réussi</Badge>
                          )}
                          {transaction.status === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>
                          )}
                          {transaction.status === 'failed' && (
                            <Badge className="bg-red-100 text-red-800">Échoué</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Export Dialog */}
        <Dialog open={openExportDialog} onOpenChange={setOpenExportDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Exporter les transactions</DialogTitle>
              <DialogDescription>
                Choisissez le format d'export pour vos transactions
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleExportTransactions('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter en CSV
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleExportTransactions('excel')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter en Excel
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleExportTransactions('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter en PDF
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenExportDialog(false)}>
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* New Transaction Dialog */}
        <Dialog open={openNewTransactionDialog} onOpenChange={setOpenNewTransactionDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nouvelle Transaction</DialogTitle>
              <DialogDescription>
                Sélectionnez le type de transaction que vous souhaitez effectuer
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNewTransaction('deposit')}
              >
                <ArrowDownLeft className="h-4 w-4 mr-2 text-green-600" />
                Enregistrer un dépôt
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNewTransaction('withdrawal')}
              >
                <ArrowUpRight className="h-4 w-4 mr-2 text-red-600" />
                Enregistrer un retrait
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNewTransaction('loan_disbursement')}
              >
                <ArrowUpRight className="h-4 w-4 mr-2 text-red-600" />
                Décaissement de prêt
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNewTransaction('loan_repayment')}
              >
                <ArrowDownLeft className="h-4 w-4 mr-2 text-green-600" />
                Remboursement de prêt
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNewTransaction('transfer')}
              >
                <ArrowUpRight className="h-4 w-4 mr-2 text-blue-600" />
                Transfert entre comptes
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenNewTransactionDialog(false)}>
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SfdTransactionsPage;
