
import React from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { LoanManagement } from '@/components/sfd/LoanManagement';

const SfdLoansPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <LoanManagement />
      </main>
    </div>
  );
};

export default SfdLoansPage;
