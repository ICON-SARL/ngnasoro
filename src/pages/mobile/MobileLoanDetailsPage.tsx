
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loan, LoanPayment } from '@/types/sfdClients';
import { Skeleton } from '@/components/ui/skeleton';
import { CashierQRScanner } from '@/components/mobile/funds/CashierQRScanner';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import MobileMoneyRepaymentModal from '@/components/mobile/loan/MobileMoneyRepaymentModal';

const MobileLoanDetailsPage = () => {
  const navigate = useNavigate();
  const { loanId } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'tracking');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showMobileMoneyModal, setShowMobileMoneyModal] = useState(false);

  // Fetch loan details
  const { data: loan, isLoading: isLoadingLoan } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select(`
          *,
          sfd_clients!inner(full_name, email, phone),
          sfds(name, logo_url)
        `)
        .eq('id', loanId)
        .single();

      if (error) throw error;
      return {
        ...data,
        client_name: data.sfd_clients?.full_name
      } as Loan;
    },
    enabled: !!loanId
  });

  // Fetch loan payments
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['loan-payments', loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_payments')
        .select('*')
        .eq('loan_id', loanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LoanPayment[];
    },
    enabled: !!loanId
  });

  // Calculate stats
  const totalAmount = loan ? loan.amount * (1 + loan.interest_rate / 100) : 0;
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalAmount - paidAmount;
  const progress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  const handleBack = () => {
    navigate('/mobile-flow/loans');
  };

  const handleMobileMoneyPayment = () => {
    setShowMobileMoneyModal(true);
  };

  const handleCashPayment = () => {
    setShowQRScanner(true);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-700">En cours</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500/20 text-blue-700">Approuvé</Badge>;
      case 'disbursed':
        return <Badge className="bg-lime-500/20 text-lime-700">Décaissé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-700">En attente</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500/20 text-gray-700">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoadingLoan) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Prêt non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {loan.purpose || 'Prêt'}
            </h1>
            <p className="text-sm text-muted-foreground">
              #{loan.reference?.slice(0, 8) || loan.id.slice(0, 8)}
            </p>
          </div>
          {getStatusBadge(loan.status)}
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl p-6 mb-4">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-1">Montant remboursé</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-foreground">
                {Math.round(paidAmount).toLocaleString()}
              </span>
              <span className="text-lg text-muted-foreground">
                / {Math.round(totalAmount).toLocaleString()} FCFA
              </span>
            </div>
          </div>

          <Progress value={progress} className="h-3 mb-2" />
          <p className="text-center text-sm text-muted-foreground">
            {Math.round(progress)}% remboursé
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-background/50 rounded-2xl p-3 text-center">
              <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Prochaine échéance</p>
              <p className="text-sm font-semibold">
                {loan.next_payment_date 
                  ? new Date(loan.next_payment_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                  : 'N/A'
                }
              </p>
            </div>

            <div className="bg-background/50 rounded-2xl p-3 text-center">
              <Wallet className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Mensualité</p>
              <p className="text-sm font-semibold">
                {Math.round(loan.monthly_payment).toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="tracking">Suivi</TabsTrigger>
            <TabsTrigger value="repayment">Paiement</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            <div className="bg-card rounded-3xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progression
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Montant initial</span>
                  <span className="font-semibold">{loan.amount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Intérêts</span>
                  <span className="font-semibold">
                    {Math.round(totalAmount - loan.amount).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total payé</span>
                  <span className="font-semibold text-green-600">
                    {Math.round(paidAmount).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Reste à payer</span>
                  <span className="text-lg font-bold text-primary">
                    {Math.round(remainingAmount).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Repayment Tab */}
          <TabsContent value="repayment" className="space-y-4">
            <div className="bg-card rounded-3xl p-5">
              <h3 className="font-semibold mb-4">Méthodes de paiement</h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleMobileMoneyPayment}
                  className="w-full h-auto py-4 rounded-2xl flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      📱
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Mobile Money</p>
                      <p className="text-xs opacity-90">Orange, MTN, Moov</p>
                    </div>
                  </div>
                  <ChevronLeft className="h-5 w-5 rotate-180" />
                </Button>

                <Button
                  onClick={handleCashPayment}
                  variant="outline"
                  className="w-full h-auto py-4 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      🏪
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Caisse SFD</p>
                      <p className="text-xs text-muted-foreground">Scanner le QR code</p>
                    </div>
                  </div>
                  <ChevronLeft className="h-5 w-5 rotate-180" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-3">
            {isLoadingPayments ? (
              <Skeleton className="h-40 rounded-3xl" />
            ) : payments.length === 0 ? (
              <div className="bg-card rounded-3xl p-6 text-center">
                <p className="text-muted-foreground">Aucun paiement effectué</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="bg-card rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium">Paiement effectué</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {payment.amount.toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="bg-card rounded-3xl p-5 space-y-4">
              <h3 className="font-semibold">Informations du prêt</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Montant</span>
                  <span className="font-semibold">{loan.amount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Durée</span>
                  <span className="font-semibold">{loan.duration_months} mois</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taux d'intérêt</span>
                  <span className="font-semibold">{loan.interest_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date de création</span>
                  <span className="font-semibold">
                    {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {loan.approved_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date d'approbation</span>
                    <span className="font-semibold">
                      {new Date(loan.approved_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {loan.disbursed_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date de décaissement</span>
                    <span className="font-semibold">
                      {new Date(loan.disbursed_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {loan.sfds && (
              <div className="bg-card rounded-3xl p-5">
                <h3 className="font-semibold mb-3">SFD</h3>
                <div className="flex items-center gap-3">
                  {loan.sfds.logo_url && (
                    <img 
                      src={loan.sfds.logo_url} 
                      alt={loan.sfds.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <p className="font-medium">{loan.sfds.name}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Scanner */}
      {showQRScanner && (
        <CashierQRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          transactionType="withdrawal"
        />
      )}

      {/* Mobile Money Modal */}
      {showMobileMoneyModal && loan && (
        <MobileMoneyRepaymentModal
          isOpen={showMobileMoneyModal}
          onClose={() => setShowMobileMoneyModal(false)}
          loan={loan}
          suggestedAmount={loan.monthly_payment || 0}
          onPaymentSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['loan', loanId] });
            queryClient.invalidateQueries({ queryKey: ['loan-payments', loanId] });
          }}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default MobileLoanDetailsPage;
