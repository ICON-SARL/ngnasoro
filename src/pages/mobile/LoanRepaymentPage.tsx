import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Calendar, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSfdLoan } from '@/hooks/useSfdLoan';
import { useLoanSchedule } from '@/hooks/useLoanSchedule';
import { LoanScheduleCard } from '@/components/mobile/loan/schedule/LoanScheduleCard';
import { NextPaymentCard } from '@/components/mobile/loan/repayment/NextPaymentCard';
import { PaymentHistoryCard } from '@/components/mobile/loan/repayment/PaymentHistoryCard';
import { PaymentOptionCard } from '@/components/mobile/loan/repayment/PaymentOptionCard';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { usePaymentActions } from '@/components/mobile/loan/repayment/usePaymentActions';
import { Smartphone, Building2 } from 'lucide-react';

const LoanRepaymentPage: React.FC = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const { data: loan, isLoading: loanLoading } = useSfdLoan(loanId || '');
  const {
    nextDue,
    totalRemaining,
    totalLateFees,
    overdueInstallments,
    totalInstallments,
    paidInstallments,
    isLoading: scheduleLoading
  } = useLoanSchedule(loanId || '');

  const { handlePaymentMethod } = usePaymentActions({
    loanId,
    onMobileMoneyPayment: () => {
      // QR code agency payment
      navigate('/mobile-flow/qr-scanner', {
        state: { isRepayment: true, loanId }
      });
    },
    sfdId: loan?.sfd_id
  });

  if (loanLoading || scheduleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <p className="text-muted-foreground mb-4">Prêt introuvable</p>
        <Button onClick={() => navigate('/mobile-flow/dashboard')}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  const remainingInstallments = totalInstallments - paidInstallments;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header avec gradient et résumé */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        {/* Barre de navigation */}
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Remboursement de prêt</h1>
            <p className="text-sm opacity-90">Prêt #{loan.id.substring(0, 8)}</p>
          </div>
        </div>

        {/* Stats résumé */}
        <div className="px-4 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 opacity-80" />
                <p className="text-xs opacity-80">Montant restant</p>
              </div>
              <p className="text-2xl font-bold">{totalRemaining.toLocaleString()} FCFA</p>
              {totalLateFees > 0 && (
                <p className="text-xs mt-1 opacity-90">
                  dont {totalLateFees.toLocaleString()} FCFA de frais
                </p>
              )}
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 opacity-80" />
                <p className="text-xs opacity-80">Échéances restantes</p>
              </div>
              <p className="text-2xl font-bold">{remainingInstallments}</p>
              {overdueInstallments > 0 && (
                <p className="text-xs mt-1 text-red-200">
                  {overdueInstallments} en retard
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec onglets */}
      <div className="p-4 space-y-4">
        {/* Prochaine échéance en évidence */}
        {nextDue && (
          <NextPaymentCard
            nextPaymentDue={new Date(nextDue.due_date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
            amountDue={nextDue.total_amount - nextDue.paid_amount + nextDue.late_fee}
            isLate={nextDue.status === 'overdue'}
            lateFees={nextDue.late_fee}
            onMakePayment={() => handlePaymentMethod('mobile')}
          />
        )}

        {/* Onglets */}
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">
              <TrendingDown className="h-4 w-4 mr-2" />
              Échéancier
            </TabsTrigger>
            <TabsTrigger value="history">
              <Calendar className="h-4 w-4 mr-2" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="options">
              <Wallet className="h-4 w-4 mr-2" />
              Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-4">
            <LoanScheduleCard loanId={loanId || ''} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <PaymentHistoryCard
              paymentHistory={[]} // TODO: Implémenter récupération historique
            />
          </TabsContent>

          <TabsContent value="options" className="mt-4 space-y-3">
            <div className="space-y-3">
              <div 
                className="border-2 border-primary bg-primary/5 rounded-lg p-4 cursor-pointer hover:bg-primary/10 transition-all"
                onClick={() => handlePaymentMethod('mobile')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Mobile Money</h4>
                    <p className="text-sm text-muted-foreground">Orange Money, MTN, Moov Money</p>
                  </div>
                  <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    Recommandé
                  </div>
                </div>
              </div>

              <div 
                className="border-2 border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => handlePaymentMethod('agency')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-secondary">
                    <Building2 className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Paiement en agence</h4>
                    <p className="text-sm text-muted-foreground">Scanner le QR code du caissier</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default LoanRepaymentPage;
