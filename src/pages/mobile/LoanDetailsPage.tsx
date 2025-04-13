
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoanDetails } from '@/hooks/useLoanDetails';
import LoanTrackingTab from '@/components/mobile/loan/LoanTrackingTab';
import LoanDetailsTab from '@/components/mobile/loan/LoanDetailsTab';
import LoanRepaymentTab from '@/components/mobile/loan/LoanRepaymentTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog } from '@/components/ui/dialog';
import QRCodePaymentDialog from '@/components/mobile/loan/QRCodePaymentDialog';
import { useToast } from '@/hooks/use-toast';

const LoanDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tracking');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [isWithdrawal, setIsWithdrawal] = useState(false);
  
  // Get loanId from location state
  const loanId = location.state?.loanId;
  
  // Fetch loan details
  const { loanStatus, loanDetails, isLoading, refetch } = useLoanDetails(loanId);
  
  useEffect(() => {
    if (!loanId) {
      toast({
        title: "Erreur",
        description: "Identifiant de prêt manquant",
        variant: "destructive",
      });
      navigate('/mobile-flow/my-loans');
    }
  }, [loanId, navigate, toast]);
  
  const handleBack = () => {
    navigate('/mobile-flow/my-loans');
  };
  
  const handleMobileMoneyPayment = (isWithdrawal = false) => {
    setIsWithdrawal(isWithdrawal);
    setQrDialogOpen(true);
  };
  
  const handlePaymentComplete = () => {
    setQrDialogOpen(false);
    toast({
      title: isWithdrawal ? "Retrait effectué" : "Paiement effectué",
      description: isWithdrawal 
        ? "Le montant a été envoyé à votre mobile money" 
        : "Votre paiement a bien été reçu et enregistré",
      className: 'border-[#0D6A51] bg-[#0D6A51]/10'
    });
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#0D6A51] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 bg-white shadow-sm">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 mr-2 text-[#0D6A51]" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#0D6A51]">Détails du prêt</h1>
            <p className="text-gray-500 text-sm">{loanDetails.loanPurpose}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
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
              onWithdraw={() => handleMobileMoneyPayment(true)}
            />
          </TabsContent>

          <TabsContent value="repayment">
            <LoanRepaymentTab 
              nextPaymentDue={loanStatus.nextPaymentDue}
              paymentHistory={loanStatus.paymentHistory}
              onMobileMoneyPayment={() => handleMobileMoneyPayment(false)}
              loanId={loanId}
            />
          </TabsContent>
        </Tabs>
        
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <QRCodePaymentDialog 
            onClose={() => setQrDialogOpen(false)} 
            onComplete={handlePaymentComplete}
            amount={isWithdrawal ? loanStatus.totalAmount : loanStatus.remainingAmount} 
            isWithdrawal={isWithdrawal} 
          />
        </Dialog>
      </div>
    </div>
  );
};

export default LoanDetailsPage;
