import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { usePaginatedLoans } from './hooks/sfd-management/usePaginatedLoans';
import { LoanCard } from './LoanCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CacheService } from '@/utils/cacheService';
import { DataPagination } from '@/components/ui/data-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarIcon, 
  CheckSquare, 
  CircleDollarSign, 
  Users, 
  XCircle, 
  RefreshCw 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SfdAdminDashboard = () => {
  const { user, session } = useAuth();
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [sfdId, setSfdId] = useState('');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState([]);
  
  // Utiliser notre hook paginé pour les prêts
  const {
    loans,
    pagination,
    isLoading,
    isError,
    refetch,
    invalidateLoansCache,
    handlePageChange,
    handlePageSizeChange,
    handleStatusFilter,
    currentPage,
    currentPageSize,
    currentStatus
  } = usePaginatedLoans(sfdId, { page: 1, pageSize: 10 });

  // Sélectionner le SFD par défaut
  useEffect(() => {
    const fetchDefaultSfd = async () => {
      if (!user) return;
      
      try {
        // Essayer d'abord d'obtenir du cache
        const cachedSfdId = await CacheService.get(`default_sfd_${user.id}`, 'user_preferences');
        
        if (cachedSfdId) {
          setSfdId(cachedSfdId);
          return;
        }
        
        // Si pas dans le cache, charger depuis la base de données
        const { data, error } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSfdId(data.sfd_id);
          // Mettre en cache pour les prochaines visites
          await CacheService.set(`default_sfd_${user.id}`, data.sfd_id, { 
            namespace: 'user_preferences',
            ttl: 24 * 60 * 60 * 1000 // 24 heures
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du SFD par défaut:", error);
      }
    };
    
    fetchDefaultSfd();
  }, [user]);

  // Charger les statistiques mensuelles depuis le cache ou la base de données
  useEffect(() => {
    const fetchMonthlyStats = async () => {
      if (!sfdId) return;
      
      setIsLoadingStats(true);
      
      try {
        // Essayer de charger depuis le cache
        const cachedStats = await CacheService.getOrSet(
          `monthly_stats_${sfdId}`,
          async () => {
            // Si pas dans le cache, charger depuis la base de données
            const { data, error } = await supabase
              .from('sfd_loans')
              .select('id, status, created_at, amount')
              .eq('sfd_id', sfdId)
              .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString());
              
            if (error) throw error;
            
            // Traiter les données pour créer les statistiques mensuelles
            return generateMonthlyStats(data);
          },
          {
            namespace: sfdId,
            ttl: 60 * 60 * 1000 // 1 heure de cache
          }
        );
        
        setMonthlyStats(cachedStats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          variant: "destructive"
        });
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchMonthlyStats();
  }, [sfdId]);

  // Handle loan approval
  const handleApprove = (loan) => {
    setSelectedLoan(loan);
    setApprovalNote('');
    setIsApproveDialogOpen(true);
  };
  
  // Handle loan rejection
  const handleReject = (loan) => {
    setSelectedLoan(loan);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };
  
  // Submit approval
  const submitApproval = async () => {
    if (!selectedLoan) return;
    
    try {
      // Appeler l'API pour approuver le prêt
      const { error } = await supabase
        .from('sfd_loans')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', selectedLoan.id);
        
      if (error) throw error;
      
      // Journaliser l'action
      await supabase.from('loan_activities').insert({
        loan_id: selectedLoan.id,
        performed_by: user?.id,
        activity_type: 'loan_approval',
        description: approvalNote || 'Prêt approuvé'
      });
      
      setIsApproveDialogOpen(false);
      toast({
        title: "Prêt approuvé",
        description: "Le prêt a été approuvé avec succès",
      });
      
      // Invalider le cache pour forcer le rechargement des données
      invalidateLoansCache();
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
      // Appeler l'API pour rejeter le prêt
      const { error } = await supabase
        .from('sfd_loans')
        .update({ status: 'rejected' })
        .eq('id', selectedLoan.id);
        
      if (error) throw error;
      
      // Journaliser le rejet avec la raison
      await supabase.from('loan_activities').insert({
        loan_id: selectedLoan.id,
        performed_by: user?.id,
        activity_type: 'loan_rejection',
        description: rejectionReason
      });
      
      setIsRejectDialogOpen(false);
      toast({
        title: "Prêt rejeté",
        description: "Le prêt a été rejeté",
      });
      
      // Invalider le cache pour forcer le rechargement des données
      invalidateLoansCache();
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du rejet du prêt",
        variant: "destructive"
      });
    }
  };
  
  // Compter les prêts par statut
  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const approvedLoans = loans.filter(loan => loan.status === 'approved');
  const rejectedLoans = loans.filter(loan => loan.status === 'rejected');
  
  if (!sfdId) {
    return (
      <div className="p-4 text-center">
        <p>Aucun SFD par défaut n'a été trouvé.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord Admin SFD</h1>
        <Button onClick={() => {
          invalidateLoansCache();
          refetch();
          CacheService.clearNamespace(sfdId);
          toast({
            title: "Actualisation",
            description: "Les données ont été actualisées",
          });
        }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
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
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold">{pendingLoans.length}</p>
                <p className="text-sm text-muted-foreground">Requiert votre validation</p>
              </>
            )}
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
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold">{approvedLoans.length}</p>
                <p className="text-sm text-muted-foreground">Derniers 30 jours</p>
              </>
            )}
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
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold">{rejectedLoans.length}</p>
                <p className="text-sm text-muted-foreground">Derniers 30 jours</p>
              </>
            )}
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
            {isLoadingStats ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
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
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Loans Tabs */}
      <Tabs 
        defaultValue="pending" 
        className="space-y-4"
        onValueChange={(value) => handleStatusFilter(value === 'all' ? undefined : value)}
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">
            Tous
          </TabsTrigger>
          <TabsTrigger value="pending">
            En attente
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvés
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetés
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {renderLoansContent(loans, isLoading, isError, handleApprove, handleReject, true)}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {renderLoansContent(pendingLoans, isLoading, isError, handleApprove, handleReject, true)}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {renderLoansContent(approvedLoans, isLoading, isError, handleApprove, handleReject, false)}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {renderLoansContent(rejectedLoans, isLoading, isError, handleApprove, handleReject, false)}
        </TabsContent>
      </Tabs>
      
      {/* Pagination */}
      {!isLoading && loans.length > 0 && (
        <DataPagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalCount}
          pageSize={currentPageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      )}
      
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

// Helper function to render loans content
function renderLoansContent(loans, isLoading, isError, onApprove, onReject, showActions) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>Une erreur s'est produite lors du chargement des données.</p>
      </div>
    );
  }
  
  if (loans.length === 0) {
    return (
      <div className="text-center p-4">
        <p>Aucune demande de prêt trouvée</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <LoanCard 
          key={loan.id} 
          loan={loan} 
          onApprove={onApprove} 
          onReject={onReject}
          showActions={showActions && loan.status === 'pending'}
        />
      ))}
    </div>
  );
}

// Helper function to generate monthly stats
function generateMonthlyStats(loans = []) {
  // Créer un tableau de 6 derniers mois
  const monthsData = {};
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
    monthsData[monthName] = { approved: 0, rejected: 0, pending: 0, total: 0 };
  }
  
  // Compter les prêts par mois et par statut
  loans.forEach(loan => {
    const createdAt = new Date(loan.created_at);
    const monthName = createdAt.toLocaleDateString('fr-FR', { month: 'short' });
    
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
  
  // Convertir l'objet en tableau pour le graphique
  return Object.keys(monthsData).map(month => ({
    month,
    total: monthsData[month].total,
    approved: monthsData[month].approved,
    rejected: monthsData[month].rejected,
    pending: monthsData[month].pending
  }));
}

export default SfdAdminDashboard;
