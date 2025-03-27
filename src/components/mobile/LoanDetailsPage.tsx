
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
}

const LoanDetailsPage: React.FC<LoanDetailsPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
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
  const { getActiveSfdData } = useSfdDataAccess();
  
  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  useEffect(() => {
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
  }, [toast]);

  const handleMobileMoneyPayment = async () => {
    try {
      setMobileMoneyInitiated(true);
    } catch (error) {
      console.error('Mobile Money error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initialisation du paiement",
        variant: "destructive",
      });
    }
  };
  
  const handleAgencyQRPayment = () => {
    setQrDialogOpen(true);
  };

  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
  };
  
  const handleSuccess = async () => {
    toast({
      title: "Opération réussie",
      description: "Votre transaction a été effectuée avec succès",
    });
    
    // Mise à jour du statut du prêt pour simuler le paiement
    setLoanStatus(prev => ({
      ...prev,
      paidAmount: prev.paidAmount + 3.5,
      remainingAmount: prev.remainingAmount - 3.5,
      progress: Math.min(100, prev.progress + 10),
      paymentHistory: [
        { id: prev.paymentHistory.length + 1, date: new Date().toLocaleDateString('fr-FR'), amount: 3.50, status: 'paid' },
        ...prev.paymentHistory
      ]
    }));
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="tracking">Suivi</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="repayment">Remboursement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracking">
          <LoanTrackingTab 
            paidAmount={loanStatus.paidAmount}
            totalAmount={loanStatus.totalAmount}
            remainingAmount={loanStatus.remainingAmount}
            progress={loanStatus.progress}
            nextPaymentDue={loanStatus.nextPaymentDue}
            lateFees={loanStatus.lateFees}
          />
        </TabsContent>
        
        <TabsContent value="details">
          <LoanDetailsTab 
            loanType="Microcrédit Entreprise"
            loanPurpose="Fonds de roulement"
            disbursalDate="01 Avril 2023"
            endDate="01 Avril 2024"
            loanAmount={25400}
            interestRate={12}
            status="En cours"
            disbursed={loanStatus.disbursed}
            withdrawn={loanStatus.withdrawn}
            onWithdraw={() => navigate('/mobile-flow/secure-payment', { state: { isWithdrawal: true } })}
          />
        </TabsContent>
        
        <TabsContent value="repayment">
          <LoanRepaymentTab 
            nextPaymentDue={loanStatus.nextPaymentDue}
            paymentHistory={loanStatus.paymentHistory}
            onMobileMoneyPayment={handleMobileMoneyPayment}
            onAgencyQRPayment={handleAgencyQRPayment}
            loanId="LOAN123"
          />
        </TabsContent>
      </Tabs>
      
      {mobileMoneyInitiated && (
        <MobileMoneyModal 
          onClose={() => setMobileMoneyInitiated(false)}
          isWithdrawal={false}
          amount={3500}
          onSuccess={handleSuccess}
        />
      )}
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <QRCodePaymentDialog 
          onClose={() => setQrDialogOpen(false)} 
          amount={3500} 
          isWithdrawal={false}
          onSuccess={handleSuccess}
        />
      </Dialog>
    </div>
  );
};

export default LoanDetailsPage;
