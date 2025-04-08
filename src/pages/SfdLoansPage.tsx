
import React, { useState } from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, BookOpen } from 'lucide-react';
import { LoanWorkflow, LoanPlansManager } from '@/components/sfd/loans';

const SfdLoansPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('loans');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto p-4 md:p-6 mt-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Loan Management</h1>
              <TabsList>
                <TabsTrigger value="loans" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Loans
                </TabsTrigger>
                <TabsTrigger value="plans" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Loan Plans
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="loans">
              <LoanWorkflow />
            </TabsContent>
            
            <TabsContent value="plans">
              <LoanPlansManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SfdLoansPage;
