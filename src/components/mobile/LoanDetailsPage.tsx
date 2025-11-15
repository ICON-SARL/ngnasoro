
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoanDetails } from '@/hooks/useLoanDetails';
import { useLoanPayment } from '@/hooks/useLoanPayment';
import LoanDetailsHeader from './loan/LoanDetailsHeader';
import LoanTabsManager from './loan/LoanTabsManager';
import MobileMoneyModal from './loan/MobileMoneyModal';
import MobileNavigation from './MobileNavigation';
import { LoanStatus, LoanDetails } from '@/types/loans';

export interface LoanDetailsPageProps {
  onBack?: () => void;
  loanId?: string;
}

const LoanDetailsPage: React.FC<LoanDetailsPageProps> = ({ onBack, loanId: propLoanId }) => {
  const navigate = useNavigate();
  const params = useParams<{ loanId?: string }>();
  
  // Use loanId from props or from URL params
  const loanId = propLoanId || params.loanId;
  
  const [activeTab, setActiveTab] = useState('tracking');
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  
  // Use our custom hooks
  const { loanStatus, loanDetails } = useLoanDetails(loanId);
  const { handleMobileMoneyPayment } = useLoanPayment(loanId);

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
    
    navigate(`/mobile-flow/loan-process/${loanId}`);
  };

  const handleMobileMoneyWithdrawal = async () => {
    const success = await handleMobileMoneyPayment();
    if (success) {
      setMobileMoneyInitiated(true);
    }
  };

  return (
    <div className="h-full bg-white pb-20">
      <LoanDetailsHeader 
        onBack={handleBackAction} 
        onViewProcess={viewLoanProcess} 
      />

      <div className="p-4 space-y-4">
        {(loanDetails?.status === 'active' || loanStatus?.disbursed) && (
          <button
            onClick={() => navigate(`/mobile-flow/loan/${loanId}/repayment`)}
            className="w-full bg-[#0D6A51] hover:bg-[#0A5441] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Voir l'échéancier et rembourser
          </button>
        )}
        
        <LoanTabsManager
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          loanStatus={loanStatus}
          loanDetails={loanDetails}
          onMobileMoneyPayment={handleMobileMoneyWithdrawal}
          loanId={loanId}
        />
      </div>
      
      {mobileMoneyInitiated && (
        <MobileMoneyModal onClose={() => setMobileMoneyInitiated(false)} />
      )}
      
      {/* Ajout du composant MobileNavigation en bas de la page */}
      <div className="fixed bottom-0 left-0 right-0">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default LoanDetailsPage;
