
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, ExternalLink, Info } from 'lucide-react';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { NewLoanForm } from './loans/NewLoanForm';
import LoanDetails from './loans/LoanDetails';
import { LoanRepaymentForm } from './loans/LoanRepaymentForm';
import { useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Search, Plus, Eye, ChevronDown, CreditCard, 
  Clock, CheckCircle, XCircle, Filter, ArrowUp, Banknote,
  AlertTriangle, CalendarCheck, DollarSign
} from 'lucide-react';
import { Loan } from '@/types/sfdClients';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateToLocale } from '@/utils/dateUtils';

export function LoanManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewLoanDialogOpen, setIsNewLoanDialogOpen] = useState(false);
  const [isRepaymentDialogOpen, setIsRepaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Simuler une demande de refresh des statistiques du tableau de bord
  // quand ce composant est monté via useQueryClient
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);

  // Récupérer les données des prêts depuis Supabase via le hook useSfdLoans
  const { 
    loans, 
    isLoading, 
    createLoan, 
    approveLoan, 
    rejectLoan, 
    disburseLoan,
    recordPayment,
    refetch
  } = useSfdLoans();

  // Make sure loans is always an array before filtering
  const loansArray = Array.isArray(loans) ? loans : [];

  // Filtrer les prêts selon le terme de recherche
  const filteredLoans = loansArray.filter(loan => 
    loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loan.amount && loan.amount.toString().includes(searchTerm))
  );

  // Filtrer les prêts selon l'onglet actif
  const getFilteredLoansByStatus = () => {
    if (activeTab === 'all') return filteredLoans;
    if (activeTab === 'pending') return filteredLoans.filter(loan => loan.status === 'pending');
    if (activeTab === 'approved') return filteredLoans.filter(loan => loan.status === 'approved');
    if (activeTab === 'active') return filteredLoans.filter(loan => loan.status === 'active');
    if (activeTab === 'disbursed') return filteredLoans.filter(loan => loan.status === 'disbursed');
    if (activeTab === 'completed') return filteredLoans.filter(loan => loan.status === 'completed');
    if (activeTab === 'rejected') return filteredLoans.filter(loan => loan.status === 'rejected');
    return filteredLoans;
  };

  const displayedLoans = getFilteredLoansByStatus();
  
  // Calculer les prêts pour la pagination
  const indexOfLastLoan = currentPage * itemsPerPage;
  const indexOfFirstLoan = indexOfLastLoan - itemsPerPage;
  const currentLoans = displayedLoans.slice(indexOfFirstLoan, indexOfLastLoan);
  const totalPages = Math.ceil(displayedLoans.length / itemsPerPage);

  // Afficher les détails d'un prêt
  const handleViewLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailsDialogOpen(true);
  };

  // Ouvrir le formulaire de remboursement
  const handleOpenRepayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsRepaymentDialogOpen(true);
  };

  // Approuver un prêt
  const handleApproveLoan = (loanId: string) => {
    approveLoan.mutate({ loanId }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  // Rejeter un prêt
  const handleRejectLoan = (loanId: string) => {
    rejectLoan.mutate({ loanId }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  // Décaisser un prêt
  const handleDisburseLoan = (loanId: string) => {
    disburseLoan.mutate({ loanId }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  // Obtenir un badge visuel selon le statut du prêt
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approuvé</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actif</Badge>;
      case 'disbursed':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Décaissé</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Terminé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Formatter un montant en FCFA
  const formatAmount = (amount?: number) => {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Calculer la date d'échéance basée sur la date de création et la durée
  const calculateDueDate = (createdAt?: string, durationMonths?: number) => {
    if (!createdAt || !durationMonths) return 'N/A';
    
    const date = new Date(createdAt);
    date.setMonth(date.getMonth() + durationMonths);
    return formatDateToLocale(date.toISOString());
  };

  // Calculer le statut de remboursement (fictif pour l'exemple)
  const calculateRepaymentStatus = (loan: Loan) => {
    // Dans un système réel, vous calculeriez cela à partir des paiements effectués
    // Pour l'exemple, nous utilisons une valeur aléatoire
    const paymentRatio = Math.random();
    
    if (paymentRatio > 0.9) {
      return (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-600">À jour</span>
        </div>
      );
    } else if (paymentRatio > 0.7) {
      return (
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-blue-500 mr-1" />
          <span className="text-blue-600">Prochain: 15/05/2025</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
          <span className="text-red-600">Retard: 2 paiements</span>
        </div>
      );
    }
  };

  // Obtenir des actions contextuelles basées sur le statut du prêt
  const getContextualActions = (loan: Loan) => {
    switch (loan.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => handleApproveLoan(loan.id)}
            >
              <CheckCircle className="h-3 w-3 mr-1" /> Approuver
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => handleRejectLoan(loan.id)}
            >
              <XCircle className="h-3 w-3 mr-1" /> Rejeter
            </Button>
          </div>
        );
      case 'approved':
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => handleDisburseLoan(loan.id)}
          >
            <Banknote className="h-3 w-3 mr-1" /> Décaisser
          </Button>
        );
      case 'active':
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => handleOpenRepayment(loan)}
          >
            <CreditCard className="h-3 w-3 mr-1" /> Remboursement
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Prêts</h2>
          <p className="text-muted-foreground">
            Gérez les demandes de prêt, les approbations et les remboursements
          </p>
        </div>
        <Button 
          onClick={() => setIsNewLoanDialogOpen(true)} 
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Nouveau Prêt
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un prêt..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full md:w-[180px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrer par statut" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les prêts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="disbursed">Décaissés</SelectItem>
            <SelectItem value="completed">Terminés</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
              <span className="ml-2">Chargement des prêts...</span>
            </div>
          ) : currentLoans.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>Aucun prêt trouvé avec les critères actuels.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID / Client</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Durée / Échéance</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Remboursement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div className="font-medium">
                            {loan.id?.substring(0, 6)}...
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {loan.client_name || 'Client #' + loan.client_id?.substring(0, 4)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatAmount(loan.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Taux: {loan.interest_rate}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {loan.duration_months} mois
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center text-xs text-muted-foreground cursor-help">
                                  <CalendarCheck className="h-3 w-3 mr-1" />
                                  Fin: {calculateDueDate(loan.created_at, loan.duration_months)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Date prévue de fin du prêt</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(loan.status)}
                          {loan.subsidy_amount > 0 && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                              Subventionné
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {loan.status === 'active' && calculateRepaymentStatus(loan)}
                          {loan.status === 'active' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <DollarSign className="h-3 w-3 inline" /> Mensualité: {formatAmount(loan.monthly_payment)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewLoan(loan)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {getContextualActions(loan)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={currentPage === page}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog for creating a new loan */}
      <Dialog open={isNewLoanDialogOpen} onOpenChange={setIsNewLoanDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nouveau Prêt</DialogTitle>
          </DialogHeader>
          <NewLoanForm 
            onCancel={() => setIsNewLoanDialogOpen(false)}
            onSuccess={() => {
              setIsNewLoanDialogOpen(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for loan details */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du Prêt</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <LoanDetails 
              loan={selectedLoan} 
              onClose={() => setIsDetailsDialogOpen(false)}
              onAction={() => {
                setIsDetailsDialogOpen(false);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for loan repayment */}
      <Dialog open={isRepaymentDialogOpen} onOpenChange={setIsRepaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer un Remboursement</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <LoanRepaymentForm 
              loan={selectedLoan}
              onCancel={() => setIsRepaymentDialogOpen(false)}
              onSuccess={() => {
                setIsRepaymentDialogOpen(false);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
