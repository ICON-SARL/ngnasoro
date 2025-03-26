
import React from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import LoanApplicationFlow from '@/components/LoanApplicationFlow';

const MobileFlow = () => {
  return (
    <div className="min-h-screen bg-background">
      <LoanApplicationFlow />
      <MobileNavigation />
    </div>
  );
};

export default MobileFlow;
