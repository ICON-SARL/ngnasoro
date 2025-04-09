import React, { useState } from 'react';
import { useLoanRepayments } from '@/hooks/useLoanRepayments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart4,
  Filter,
  Download,
  FileText,
  User,
  Search
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loan } from '@/types/sfdClients';

export function LoanRepaymentTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentLoan, setCurrentLoan] = useState<Loan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  
  const { 
    activeLoans, 
    overdueLoans, 
    paymentsDue, 
    recordPayment,
    isLoading,
    exportRepaymentReport
  } = useLoanRepayments();
  
  const filteredLoans = [...activeLoans, ...overdueLoans].filter(loan => {
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue' && loan.status !== 'overdue') return false;
      if (statusFilter === 'active' && loan.status === 'overdue') return false;
    }
    
    // Apply search filter to client name or reference
    return (
      loan.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const handleRecordPayment = async () => {
    if (!currentLoan || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    
    await recordPayment.mutateAsync({
      loanId: currentLoan.id,
      amount,
      paymentMethod
    });
    
    setShowPaymentDialog(false);
    setCurrentLoan(null);
    setPaymentAmount('');
  };
  
  const handleOpenPaymentDialog = (loan: any) => {
    // Make sure loan has all required fields from the Loan interface before setting
    const completeLoan: Loan = {
      id: loan.id,
      client_id: loan.client_id,
      sfd_id: loan.sfd_id || '',
      amount: loan.amount,
      interest_rate: loan.interest_rate,
      term_months: loan.term_months || loan.duration_months, // Use term_months if available, otherwise duration_months
      duration_months: loan.duration_months,
      status: loan.status,
      created_at: loan.created_at,
      updated_at: loan.updated_at || loan.created_at, // Default to created_at if updated_at isn't available
      // Include optional properties that are available
      purpose: loan.purpose,
      monthly_payment: loan.monthly_payment,
      next_payment_date: loan.next_payment_date,
      client_name: loan.client_name,
      reference: loan.reference
    };
    
    setCurrentLoan(completeLoan);
    setShowPaymentDialog(true);
    setPaymentAmount(loan.monthly_payment?.toString() || '');
  };
  
  const renderLoanStatus = (status: string, daysOverdue?: number) => {
    if (status === 'overdue') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          En retard {daysOverdue && `(${daysOverdue} jours)`}
        </Badge>
      );
    }
    
    if (status === 'active') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          En cours
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700">
        {status}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Suivi des Remboursements</h2>
          <p className="text-sm text-muted-foreground">
            Suivez les échéances et l'historique des remboursements
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportRepaymentReport()}>
            <Download className="h-4 w-4 mr-1" />
            Exporter
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              Prêts Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
              Prêts en Retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueLoans.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Échéances à venir (7j)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentsDue.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par client ou référence..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les prêts</SelectItem>
              <SelectItem value="active">Prêts actifs</SelectItem>
              <SelectItem value="overdue">Prêts en retard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="loans">
        <TabsList>
          <TabsTrigger value="loans">
            <DollarSign className="h-4 w-4 mr-1" />
            Prêts
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <Clock className="h-4 w-4 mr-1" />
            Échéances à venir
          </TabsTrigger>
          <TabsTrigger value="history">
            <BarChart4 className="h-4 w-4 mr-1" />
            Historique
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="loans" className="border rounded-lg mt-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center p-8">
              <p>Aucun prêt trouvé avec les critères actuels</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Mensualité</TableHead>
                  <TableHead>Prochaine échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map(loan => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{loan.client_name}</p>
                          <p className="text-xs text-muted-foreground">Réf: {loan.reference || loan.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {Number(loan.amount).toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      {Number(loan.monthly_payment).toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      {loan.next_payment_date 
                        ? new Date(loan.next_payment_date).toLocaleDateString() 
                        : 'Non définie'}
                    </TableCell>
                    <TableCell>
                      {renderLoanStatus(loan.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenPaymentDialog(loan)}
                        >
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                          Paiement
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Détails</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="border rounded-lg mt-4">
          {paymentsDue.length === 0 ? (
            <div className="text-center p-8">
              <p>Aucune échéance à venir dans les 7 prochains jours</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant dû</TableHead>
                  <TableHead>Date d'échéance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsDue.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.client_name}</p>
                          <p className="text-xs text-muted-foreground">Réf: {payment.loan_reference || payment.loan_id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {Number(payment.amount).toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      {new Date(payment.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        Enregistrer paiement
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <div className="text-center p-8 border rounded-lg">
            <p>Historique des remboursements</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>
              {currentLoan?.client_name} - Prêt Réf: {currentLoan?.reference || currentLoan?.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Montant</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Montant du paiement"
                  className="pl-8"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Méthode de paiement</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleRecordPayment} disabled={!paymentAmount || recordPayment.isPending}>
              {recordPayment.isPending ? 'Enregistrement...' : 'Enregistrer le paiement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
