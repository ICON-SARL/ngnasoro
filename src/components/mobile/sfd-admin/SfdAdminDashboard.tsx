
import React, { useState } from 'react';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loan } from '@/types/sfdClients';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarIcon, CheckSquare, CircleDollarSign, FileText, Users, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthlyStats {
  month: string;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

const SfdAdminDashboard: React.FC = () => {
  const { loans, isLoading, isError, approveLoan, rejectLoan, refetch } = useSfdLoans();
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  
  // Count loans by status
  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const approvedLoans = loans.filter(loan => loan.status === 'approved');
  const rejectedLoans = loans.filter(loan => loan.status === 'rejected');
  
  // Create monthly stats for chart
  const monthlyStats: MonthlyStats[] = generateMonthlyStats(loans);
  
  // Handle loan approval
  const handleApprove = (loan: Loan) => {
    setSelectedLoan(loan);
    setApprovalNote('');
    setIsApproveDialogOpen(true);
  };
  
  // Handle loan rejection
  const handleReject = (loan: Loan) => {
    setSelectedLoan(loan);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };
  
  // Submit approval
  const submitApproval = async () => {
    if (!selectedLoan) return;
    
    try {
      await approveLoan.mutateAsync({ loanId: selectedLoan.id });
      setIsApproveDialogOpen(false);
      toast({
        title: "Prêt approuvé",
        description: "Le prêt a été approuvé avec succès",
      });
      refetch();
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'approbation du prêt",
        variant: "destructive"
      });
    }
  };
  
  // Submit rejection
  const submitRejection = async () => {
    if (!selectedLoan || !rejectionReason.trim()) return;
    
    try {
      await rejectLoan.mutateAsync({ loanId: selectedLoan.id });
      setIsRejectDialogOpen(false);
      toast({
        title: "Prêt rejeté",
        description: "Le prêt a été rejeté",
      });
      refetch();
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du rejet du prêt",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51] mx-auto"></div>
        <p className="mt-4">Chargement des données...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Une erreur s'est produite lors du chargement des données.</p>
        <Button onClick={() => refetch()} className="mt-2">Réessayer</Button>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Admin SFD</h1>
        <Button onClick={() => refetch()}>Actualiser</Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-amber-600">
              <CircleDollarSign className="mr-2 h-5 w-5" />
              Demandes en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingLoans.length}</p>
            <p className="text-sm text-muted-foreground">Requiert votre validation</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-green-600">
              <CheckSquare className="mr-2 h-5 w-5" />
              Prêts approuvés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{approvedLoans.length}</p>
            <p className="text-sm text-muted-foreground">Derniers 30 jours</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="mr-2 h-5 w-5" />
              Prêts rejetés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{rejectedLoans.length}</p>
            <p className="text-sm text-muted-foreground">Derniers 30 jours</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Chart */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Évolution des demandes de prêt</CardTitle>
          <CardDescription>Aperçu mensuel des demandes par statut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" name="Approuvés" fill="#16a34a" stackId="a" />
                <Bar dataKey="pending" name="En attente" fill="#f59e0b" stackId="a" />
                <Bar dataKey="rejected" name="Rejetés" fill="#dc2626" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Loans Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pending">
            En attente ({pendingLoans.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvés ({approvedLoans.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetés ({rejectedLoans.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingLoans.length === 0 ? (
            <div className="text-center p-4">
              <p>Aucune demande de prêt en attente</p>
            </div>
          ) : (
            pendingLoans.map((loan) => (
              <LoanCard 
                key={loan.id} 
                loan={loan} 
                onApprove={handleApprove} 
                onReject={handleReject}
                showActions={true}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {approvedLoans.length === 0 ? (
            <div className="text-center p-4">
              <p>Aucun prêt approuvé récemment</p>
            </div>
          ) : (
            approvedLoans.map((loan) => (
              <LoanCard 
                key={loan.id} 
                loan={loan} 
                onApprove={handleApprove} 
                onReject={handleReject}
                showActions={false}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {rejectedLoans.length === 0 ? (
            <div className="text-center p-4">
              <p>Aucun prêt rejeté récemment</p>
            </div>
          ) : (
            rejectedLoans.map((loan) => (
              <LoanCard 
                key={loan.id} 
                loan={loan} 
                onApprove={handleApprove} 
                onReject={handleReject}
                showActions={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {/* Approval Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer l'approbation</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'approuver cette demande de prêt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <p className="font-medium">Montant: {selectedLoan?.amount} FCFA</p>
              <p>Durée: {selectedLoan?.duration_months} mois</p>
              <p>Taux d'intérêt: {selectedLoan?.interest_rate}%</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                Note d'approbation (optionnel)
              </label>
              <Textarea
                id="note"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Ajouter des notes concernant l'approbation..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitApproval}>
              Approuver le prêt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Motif du rejet</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du rejet de cette demande de prêt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <p className="font-medium">Montant: {selectedLoan?.amount} FCFA</p>
              <p>Durée: {selectedLoan?.duration_months} mois</p>
              <p>Demandeur: Identifiant {selectedLoan?.client_id}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="rejection-reason" className="text-sm font-medium">
                Motif du rejet <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Saisir le motif du rejet..."
                required
              />
              {rejectionReason.trim() === '' && (
                <p className="text-sm text-red-500">Le motif du rejet est obligatoire</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={submitRejection}
              disabled={rejectionReason.trim() === ''}
            >
              Rejeter le prêt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Component to display a loan card
interface LoanCardProps {
  loan: Loan;
  onApprove: (loan: Loan) => void;
  onReject: (loan: Loan) => void;
  showActions: boolean;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onApprove, onReject, showActions }) => {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: fr });
  };
  
  const timeAgo = (dateString: string) => {
    if (!dateString) return '';
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: fr });
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-lg">{loan.amount.toLocaleString()} FCFA</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span>Créé {timeAgo(loan.created_at)}</span>
              </div>
            </div>
            {getStatusBadge(loan.status)}
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Durée</p>
              <p className="font-medium">{loan.duration_months} mois</p>
            </div>
            <div>
              <p className="text-muted-foreground">Taux d'intérêt</p>
              <p className="font-medium">{loan.interest_rate}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mensualité</p>
              <p className="font-medium">{loan.monthly_payment?.toLocaleString() || 'N/A'} FCFA</p>
            </div>
            <div>
              <p className="text-muted-foreground">Objet</p>
              <p className="font-medium truncate">{loan.purpose}</p>
            </div>
          </div>
          
          {loan.status === 'approved' && (
            <div className="mt-3 text-sm">
              <p className="text-muted-foreground">Date d'approbation</p>
              <p className="font-medium">{formatDate(loan.approved_at || '')}</p>
            </div>
          )}
          
          {showActions && (
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onReject(loan)}
              >
                Rejeter
              </Button>
              <Button 
                size="sm"
                onClick={() => onApprove(loan)}
              >
                Approuver
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to generate monthly stats for the chart
function generateMonthlyStats(loans: Loan[]): MonthlyStats[] {
  // Create a map to store the counts for each month
  const monthsData: { [key: string]: { approved: number, rejected: number, pending: number, total: number } } = {};
  
  // Get the current date
  const now = new Date();
  
  // Generate the last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = format(date, 'MMM', { locale: fr });
    monthsData[monthName] = { approved: 0, rejected: 0, pending: 0, total: 0 };
  }
  
  // Count loans by month and status
  loans.forEach(loan => {
    const createdAt = parseISO(loan.created_at);
    const monthName = format(createdAt, 'MMM', { locale: fr });
    
    // Only count if the month is in our range
    if (monthsData[monthName]) {
      monthsData[monthName].total += 1;
      
      if (loan.status === 'approved') {
        monthsData[monthName].approved += 1;
      } else if (loan.status === 'rejected') {
        monthsData[monthName].rejected += 1;
      } else if (loan.status === 'pending') {
        monthsData[monthName].pending += 1;
      }
    }
  });
  
  // Convert the map to an array for the chart
  return Object.keys(monthsData).map(month => ({
    month,
    total: monthsData[month].total,
    approved: monthsData[month].approved,
    rejected: monthsData[month].rejected,
    pending: monthsData[month].pending
  }));
}

export default SfdAdminDashboard;
