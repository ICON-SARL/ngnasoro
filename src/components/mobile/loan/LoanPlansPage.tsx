
import React from 'react';
import { LoanPlansHeader } from './header/LoanPlansHeader';
import { LoanPlansDescription } from './sections/LoanPlansDescription';
import { LoanPlansTabs } from './sections/LoanPlansTabs';
import { LoanPlansFooter } from './footer/LoanPlansFooter';

const LoanPlansPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <LoanPlansHeader />
      
      <div className="p-4">
        <LoanPlansDescription />
        <LoanPlansTabs />
      </div>
      
      <LoanPlansFooter />
    </div>
  );
};

export default LoanPlansPage;
