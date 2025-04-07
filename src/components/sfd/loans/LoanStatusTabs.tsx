
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoanList from './LoanList';

interface Loan {
  id: string;
  reference?: string;
  client_id: string;
  client_name?: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  status: string;
  subsidy_amount: number;
  created_at: string;
}

interface LoanStatusTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  loans: Loan[];
  loading: boolean;
}

const LoanStatusTabs: React.FC<LoanStatusTabsProps> = ({
  activeTab,
  setActiveTab,
  loans,
  loading
}) => {
  // Filter loans based on active tab
  const filteredLoans = loans.filter(loan => {
    if (activeTab === 'all') return true;
    if (activeTab === 'defaulted' && loan.status === 'defaulted') return true;
    return loan.status === activeTab;
  });
  
  return (
    <Tabs 
      defaultValue="all" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="all">Tous les prêts</TabsTrigger>
        <TabsTrigger value="pending">En attente</TabsTrigger>
        <TabsTrigger value="approved">Approuvés</TabsTrigger>
        <TabsTrigger value="active">Actifs</TabsTrigger>
        <TabsTrigger value="defaulted">En défaut</TabsTrigger>
        <TabsTrigger value="rejected">Rejetés</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              {activeTab === 'all' && 'Tous les prêts'}
              {activeTab === 'pending' && 'Prêts en attente'}
              {activeTab === 'approved' && 'Prêts approuvés'}
              {activeTab === 'active' && 'Prêts actifs'}
              {activeTab === 'defaulted' && 'Prêts en défaut'}
              {activeTab === 'rejected' && 'Prêts rejetés'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'pending' && 'Prêts en attente d\'approbation'}
              {activeTab === 'approved' && 'Prêts approuvés en attente de décaissement'}
              {activeTab === 'active' && 'Prêts actifs en cours de remboursement'}
              {activeTab === 'defaulted' && 'Prêts avec retards de paiement significatifs'}
              {activeTab === 'rejected' && 'Prêts rejetés'}
              {activeTab === 'all' && 'Tous les prêts de la SFD'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoanList loans={filteredLoans} loading={loading} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default LoanStatusTabs;
