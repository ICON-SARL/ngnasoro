
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { NewLoanForm } from './loans/NewLoanForm';
import LoanDetails from './loans/LoanDetails';
import { useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Search, Plus, Eye, ChevronDown, CreditCard, 
  Clock, CheckCircle, XCircle, Filter, ArrowUp, Banknote
} from 'lucide-react';
import { Loan } from '@/types/sfdClients';

export function LoanManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewLoanDialogOpen, setIsNewLoanDialogOpen] = useState(false);
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
    recordPayment 
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

  // Approuver un prêt
  const handleApproveLoan = (loanId: string) => {
    approveLoan.mutate({ loanId });
  };

  // Rejeter un prêt
  const handleRejectLoan = (loanId: string) => {
    rejectLoan.mutate({ loanId });
  };

  // Décaisser un prêt
  const handleDisburseLoan = (loanId: string) => {
    disburseLoan.mutate({ loanId });
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
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Prêts</h2>
            <Button 
              onClick={() => setIsNewLoanDialogOpen(true)}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Prêt
            </Button>
          </div>
          
          <p className="text-muted-foreground">
            Ce module vous permet de gérer les prêts, d'approuver des demandes et de suivre les remboursements.
          </p>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un prêt..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-7 mb-4">
              <TabsTrigger value="all" className="flex items-center justify-center">
                <FileText className="h-4 w-4 mr-2" />
                Tous
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                En attente
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center justify-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuvés
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center justify-center">
                <ArrowUp className="h-4 w-4 mr-2" />
                Actifs
              </TabsTrigger>
              <TabsTrigger value="disbursed" className="flex items-center justify-center">
                <Banknote className="h-4 w-4 mr-2" />
                Décaissés
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center justify-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Terminés
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center justify-center">
                <XCircle className="h-4 w-4 mr-2" />
                Rejetés
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <LoansTable 
                loans={currentLoans} 
                isLoading={isLoading} 
                onViewLoan={handleViewLoan}
                onApproveLoan={handleApproveLoan}
                onRejectLoan={handleRejectLoan}
                onDisburseLoan={handleDisburseLoan}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
          </Tabs>
          
          {displayedLoans.length > itemsPerPage && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logique pour afficher les pages autour de la page actuelle
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNumber);
                          }}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Dialogue Nouveau Prêt */}
      <Dialog open={isNewLoanDialogOpen} onOpenChange={setIsNewLoanDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau prêt</DialogTitle>
          </DialogHeader>
          <NewLoanForm 
            onSuccess={() => setIsNewLoanDialogOpen(false)} 
            createLoan={createLoan}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialogue Détails Prêt */}
      {selectedLoan && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails du prêt</DialogTitle>
            </DialogHeader>
            <LoanDetails 
              loan={selectedLoan} 
              onClose={() => setIsDetailsDialogOpen(false)}
              onApproveLoan={handleApproveLoan}
              onRejectLoan={handleRejectLoan}
              onDisburseLoan={handleDisburseLoan}
              recordPayment={recordPayment}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

interface LoansTableProps {
  loans: Loan[];
  isLoading: boolean;
  onViewLoan: (loan: Loan) => void;
  onApproveLoan: (loanId: string) => void;
  onRejectLoan: (loanId: string) => void;
  onDisburseLoan: (loanId: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const LoansTable: React.FC<LoansTableProps> = ({ 
  loans, 
  isLoading, 
  onViewLoan, 
  onApproveLoan, 
  onRejectLoan,
  onDisburseLoan,
  getStatusBadge 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="text-center p-10 border border-dashed rounded-md">
        <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-muted-foreground mb-2">Aucun prêt trouvé</p>
        <p className="text-xs text-muted-foreground">Essayez de modifier vos filtres ou créez un nouveau prêt</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead>Taux</TableHead>
            <TableHead>Objet</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell className="font-medium">{loan.id.substring(0, 8)}</TableCell>
              <TableCell>{loan.client_name || `Client #${loan.client_id?.substring(0, 6)}`}</TableCell>
              <TableCell>{loan.amount?.toLocaleString('fr-FR')} FCFA</TableCell>
              <TableCell>{loan.duration_months} mois</TableCell>
              <TableCell>{loan.interest_rate}%</TableCell>
              <TableCell className="max-w-[150px] truncate">{loan.purpose}</TableCell>
              <TableCell>{getStatusBadge(loan.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {loan.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => onRejectLoan(loan.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Rejeter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => onApproveLoan(loan.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Approuver
                      </Button>
                    </>
                  )}
                  
                  {loan.status === 'approved' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => onDisburseLoan(loan.id)}
                    >
                      <Banknote className="h-3.5 w-3.5 mr-1" />
                      Décaisser
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => onViewLoan(loan)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Détails
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
