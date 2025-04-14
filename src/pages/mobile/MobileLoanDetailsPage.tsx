
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LoanTabsManager from '@/components/mobile/loan/LoanTabsManager';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoanStatus, LoanDetails } from '@/types/loans';

const MobileLoanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tracking');
  const [showMobileMoneyDialog, setShowMobileMoneyDialog] = useState(false);
  
  // Mock loan data until we fetch the actual loan
  const loanStatus: LoanStatus = {
    nextPaymentDue: '15 juin 2023',
    paidAmount: 150000,
    totalAmount: 500000,
    remainingAmount: 350000,
    progress: 30,
    lateFees: 0,
    paymentHistory: [
      { id: 1, date: '15 mai 2023', amount: 150000, status: 'paid' },
    ],
    disbursed: true,
    withdrawn: true
  };
  
  const loanDetails: LoanDetails = {
    loanType: 'Microcrédit',
    loanPurpose: 'Achat de matériel',
    totalAmount: 500000,
    disbursalDate: '15 avril 2023',
    endDate: '15 octobre 2023',
    interestRate: 5.5,
    status: 'active',
    disbursed: true,
    withdrawn: true
  };
  
  // Handle mobile money payment
  const handleMobileMoneyPayment = () => {
    setShowMobileMoneyDialog(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/my-loans')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Détails du prêt</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-bold mb-1">Prêt #{id?.substring(0, 8)}</h2>
          <p className="text-sm text-gray-500 mb-3">Microcrédit pour développement d'activité</p>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Montant total:</span>
            <span className="font-semibold">{loanStatus.totalAmount.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Restant à payer:</span>
            <span className="font-semibold">{loanStatus.remainingAmount.toLocaleString()} FCFA</span>
          </div>
        </div>
        
        <LoanTabsManager 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          loanStatus={loanStatus}
          loanDetails={loanDetails}
          onMobileMoneyPayment={handleMobileMoneyPayment}
          loanId={id}
        />
      </div>
      
      <Dialog open={showMobileMoneyDialog} onOpenChange={setShowMobileMoneyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paiement Mobile Money</DialogTitle>
            <DialogDescription>
              Un message vous a été envoyé pour confirmer le paiement de {loanStatus.remainingAmount.toLocaleString()} FCFA.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowMobileMoneyDialog(false)}>Annuler</Button>
            <Button onClick={() => {
              setShowMobileMoneyDialog(false);
              // Show success notification in a real implementation
            }}>Confirmer le paiement</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobileLoanDetailsPage;
