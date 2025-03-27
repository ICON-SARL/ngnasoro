
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

  const handleMobileMoneyWithdrawal = async () => {
    try {
      setMobileMoneyInitiated(true);
      
      // Simulating API call to MTN Mobile Money
      const activeSfd = await getActiveSfdData();
      
      if (!activeSfd) {
        throw new Error("Impossible de récupérer les données SFD");
      }
      
      toast({
        title: "Paiement Mobile Money initié",
        description: "Vérifiez votre téléphone pour confirmer le paiement",
      });
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
            <LoanDetailsTab totalAmount={loanStatus.totalAmount} />
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
