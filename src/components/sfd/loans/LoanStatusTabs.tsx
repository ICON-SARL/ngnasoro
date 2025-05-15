
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoanList from './LoanList';
import { Loan } from '@/types/sfdClients';
import { Badge } from '@/components/ui/badge';

interface LoanStatusTabsProps {
  loans: Loan[];
  loading: boolean;
}

// This component is not being used in the current code but was referenced in the build errors
// We're implementing it so it can be used if needed
export const LoanStatusTabs: React.FC<LoanStatusTabsProps> = ({ loans, loading }) => {
  const [activeTab, setActiveTab] = useState('all');

  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const approvedLoans = loans.filter(loan => loan.status === 'approved');
  const activeLoans = loans.filter(loan => loan.status === 'active');
  const completedLoans = loans.filter(loan => loan.status === 'completed');
  const rejectedLoans = loans.filter(loan => loan.status === 'rejected');

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-6 mb-4">
        <TabsTrigger value="all" className="flex gap-2">
          Tous
          <Badge variant="outline">{loans.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex gap-2">
          En attente
          <Badge variant="outline">{pendingLoans.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="approved" className="flex gap-2">
          Approuvés
          <Badge variant="outline">{approvedLoans.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="active" className="flex gap-2">
          Actifs
          <Badge variant="outline">{activeLoans.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex gap-2">
          Terminés
          <Badge variant="outline">{completedLoans.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="rejected" className="flex gap-2">
          Rejetés
          <Badge variant="outline">{rejectedLoans.length}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <LoanList />
      </TabsContent>
      <TabsContent value="pending">
        <LoanList />
      </TabsContent>
      <TabsContent value="approved">
        <LoanList />
      </TabsContent>
      <TabsContent value="active">
        <LoanList />
      </TabsContent>
      <TabsContent value="completed">
        <LoanList />
      </TabsContent>
      <TabsContent value="rejected">
        <LoanList />
      </TabsContent>
    </Tabs>
  );
};

export default LoanStatusTabs;
