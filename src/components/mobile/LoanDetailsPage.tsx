
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ActivitySquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { supabase } from '@/integrations/supabase/client';
import LoanTrackingTab from './loan/LoanTrackingTab';
import LoanDetailsTab from './loan/LoanDetailsTab';
import LoanRepaymentTab from './loan/LoanRepaymentTab';
import QRCodePaymentDialog from './loan/QRCodePaymentDialog';
import MobileMoneyModal from './loan/MobileMoneyModal';

export interface LoanDetailsPageProps {
  onBack?: () => void;
  loanId?: string;
}

const LoanDetailsPage: React.FC<LoanDetailsPageProps> = ({ onBack, loanId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  const [activeTab, setActiveTab] = useState('tracking');
  const [loanStatus, setLoanStatus] = useState({
    nextPaymentDue: '10 Juillet 2023',
    paidAmount: 10.40,
    totalAmount: 25.40,
    remainingAmount: 15.00,
    progress: 40,
    lateFees: 0,
    paymentHistory: [
      { id: 1, date: '05 August 2023', amount: 3.50, status: 'paid' },
      { id: 2, date: '05 July 2023', amount: 3.50, status: 'paid' },
      { id: 3, date: '05 June 2023', amount: 3.50, status: 'paid' }
    ],
    disbursed: true,
    withdrawn: false
  });
  const [loanDetails, setLoanDetails] = useState({
    loanType: "Microcrédit",
    loanPurpose: "Achat de matériel",
    disbursalDate: "5 janvier 2023",
    endDate: "5 juillet 2023",
    interestRate: 2.5,
    status: "actif",
    disbursed: true,
    withdrawn: false
  });
  const { getActiveSfdData } = useSfdDataAccess();
  
  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  // Fonction pour récupérer les détails du prêt depuis Supabase
  const fetchLoanDetails = async () => {
    try {
      if (!loanId) return;
      
      const { data, error } = await supabase
        .from('sfd_loans')
        .select(`
          id, 
          amount, 
          interest_rate, 
          duration_months, 
          monthly_payment,
          purpose,
          disbursed_at,
          status,
          next_payment_date,
          last_payment_date,
          sfd_id,
          client_id
        `)
        .eq('id', loanId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Mise à jour des détails du prêt
        setLoanDetails({
          loanType: data.purpose.includes('Micro') ? 'Microcrédit' : 'Prêt standard',
          loanPurpose: data.purpose,
          disbursalDate: new Date(data.disbursed_at || Date.now()).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          endDate: new Date(new Date(data.disbursed_at || Date.now()).setMonth(
            new Date(data.disbursed_at || Date.now()).getMonth() + data.duration_months
          )).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          interestRate: data.interest_rate,
          status: data.status,
          disbursed: !!data.disbursed_at,
          withdrawn: data.status === 'withdrawn'
        });
        
        // Récupération des paiements pour ce prêt
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('loan_payments')
          .select('*')
          .eq('loan_id', loanId)
          .order('payment_date', { ascending: false });
          
        if (paymentsError) throw paymentsError;
        
        // Calcul des montants payés et restants
        const paidAmount = paymentsData?.reduce((total, payment) => total + payment.amount, 0) || 0;
        const totalAmount = data.amount + (data.amount * data.interest_rate / 100);
        const remainingAmount = totalAmount - paidAmount;
        const progress = Math.min(100, Math.round((paidAmount / totalAmount) * 100));
        
        // Détermination des frais de retard
        const now = new Date();
        const nextPaymentDate = data.next_payment_date ? new Date(data.next_payment_date) : null;
        const lateFees = (nextPaymentDate && nextPaymentDate < now) ? data.monthly_payment * 0.05 : 0;
        
        // Mise en forme de l'historique des paiements
        const paymentHistory = paymentsData?.map((payment, index) => ({
          id: index + 1,
          date: new Date(payment.payment_date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }),
          amount: payment.amount,
          status: payment.status === 'completed' ? 'paid' : 'pending'
        })) || [];
        
        // Mise à jour du statut du prêt
        setLoanStatus({
          nextPaymentDue: nextPaymentDate ? nextPaymentDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }) : 'Non défini',
          paidAmount,
          totalAmount,
          remainingAmount,
          progress,
          lateFees,
          paymentHistory,
          disbursed: !!data.disbursed_at,
          withdrawn: data.status === 'withdrawn'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du prêt:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails du prêt",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    fetchLoanDetails();
    
    const setupRealtimeSubscription = async () => {
      const channel = supabase
        .channel('loan-status-changes')
        .on(
          'broadcast',
          { event: 'loan_status_update' },
          (payload) => {
            if (payload.payload) {
              const updatedStatus = payload.payload;
              setLoanStatus(prevStatus => ({
                ...prevStatus,
                ...updatedStatus
              }));
              
              if (updatedStatus.lateFees > 0) {
                toast({
                  title: "Frais de retard appliqués",
                  description: `Des frais de retard de ${updatedStatus.lateFees} FCFA ont été appliqués à votre prêt`,
                  variant: "destructive",
                });
              }
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    setupRealtimeSubscription();
  }, [loanId, toast]);

  const handleMobileMoneyWithdrawal = async () => {
    try {
      setMobileMoneyInitiated(true);
      
      // Connexion avec l'API de Mobile Money
      const activeSfd = await getActiveSfdData();
      
      if (!activeSfd) {
        throw new Error("Impossible de récupérer les données SFD");
      }
      
      // Vérification des autorisations avec l'admin SFD
      const { data, error } = await supabase.functions.invoke('mobile-money-authorization', {
        body: {
          sfdId: activeSfd.id,
          loanId: loanId,
          action: 'payment',
          amount: loanStatus.remainingAmount > 0 ? loanStatus.remainingAmount : 0
        }
      });
      
      if (error) throw error;
      
      if (data?.authorized) {
        toast({
          title: "Paiement Mobile Money initié",
          description: "Vérifiez votre téléphone pour confirmer le paiement",
        });
      } else {
        throw new Error("Paiement non autorisé par le SFD");
      }
    } catch (error) {
      console.error('Mobile Money error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initialisation du paiement",
        variant: "destructive",
      });
    }
  };

  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
    
    // Redirection vers le processus administratif du prêt
    navigate(`/mobile-flow/loan-process/${loanId}`);
  };

  return (
    <div className="h-full bg-white">
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={handleBackAction} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Détails du prêt</h1>
        <Button variant="outline" size="sm" className="flex items-center text-xs" onClick={viewLoanProcess}>
          <ActivitySquare className="h-3 w-3 mr-1" /> Processus
        </Button>
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold">Microfinance Bamako</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-gray-100 rounded-full p-1 mb-6">
            <TabsTrigger value="tracking" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Suivi
            </TabsTrigger>
            <TabsTrigger value="details" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Détails
            </TabsTrigger>
            <TabsTrigger value="repayment" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Remboursement
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracking">
            <LoanTrackingTab loanStatus={loanStatus} />
          </TabsContent>
          
          <TabsContent value="details">
            <LoanDetailsTab 
              totalAmount={loanStatus.totalAmount}
              loanType={loanDetails.loanType}
              loanPurpose={loanDetails.loanPurpose}
              disbursalDate={loanDetails.disbursalDate}
              endDate={loanDetails.endDate}
              interestRate={loanDetails.interestRate}
              status={loanDetails.status}
              disbursed={loanDetails.disbursed}
              withdrawn={loanDetails.withdrawn}
              onWithdraw={handleMobileMoneyWithdrawal}
            />
          </TabsContent>
          
          <TabsContent value="repayment">
            <Dialog>
              <LoanRepaymentTab 
                nextPaymentDue={loanStatus.nextPaymentDue}
                paymentHistory={loanStatus.paymentHistory}
                onMobileMoneyPayment={handleMobileMoneyWithdrawal}
              />
              <QRCodePaymentDialog onClose={() => {}} />
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
      
      {mobileMoneyInitiated && (
        <MobileMoneyModal onClose={() => setMobileMoneyInitiated(false)} />
      )}
    </div>
  );
};

export default LoanDetailsPage;
