
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollText, Clock, CreditCard, XCircle } from 'lucide-react';
import { Loan } from '@/types/sfdClients';
import LoanCard from './LoanCard';
import EmptyLoansState from './EmptyLoansState';

interface LoansTabsProps {
  loans: Loan[];
  isLoading: boolean;
  tabValue: string;
  setTabValue: (value: string) => void;
  canApplyForLoan: boolean;
}

const LoansTabs: React.FC<LoansTabsProps> = ({ 
  loans, 
  isLoading, 
  tabValue, 
  setTabValue,
  canApplyForLoan
}) => {
  const tabCounts = {
    all: loans.length,
    pending: loans.filter(loan => loan.status === 'pending').length,
    active: loans.filter(loan => loan.status === 'approved' || loan.status === 'active').length,
    rejected: loans.filter(loan => loan.status === 'rejected').length,
    completed: loans.filter(loan => loan.status === 'completed').length,
  };
  
  const filteredLoans = loans.filter(loan => {
    if (tabValue === 'all') return true;
    if (tabValue === 'pending') return loan.status === 'pending';
    if (tabValue === 'active') return loan.status === 'approved' || loan.status === 'active';
    if (tabValue === 'completed') return loan.status === 'completed';
    if (tabValue === 'rejected') return loan.status === 'rejected';
    return true;
  });
  
  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      <TabsList className="grid grid-cols-4 bg-gray-100/80 p-1 rounded-xl w-full">
        <TabsTrigger 
          value="all" 
          className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-[#0D6A51] data-[state=active]:shadow-sm"
        >
          <ScrollText className="h-3.5 w-3.5 mr-1.5" />
          Tous ({tabCounts.all})
        </TabsTrigger>
        <TabsTrigger 
          value="pending" 
          className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
        >
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          Attente ({tabCounts.pending})
        </TabsTrigger>
        <TabsTrigger 
          value="active" 
          className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
        >
          <CreditCard className="h-3.5 w-3.5 mr-1.5" />
          Actifs ({tabCounts.active})
        </TabsTrigger>
        <TabsTrigger 
          value="rejected" 
          className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
        >
          <XCircle className="h-3.5 w-3.5 mr-1.5" />
          Rejetés ({tabCounts.rejected})
        </TabsTrigger>
      </TabsList>
      
      <div className="p-4">
        <TabsContent value={tabValue} className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
            </div>
          ) : filteredLoans.length === 0 ? (
            <EmptyLoansState canApplyForLoan={canApplyForLoan} />
          ) : (
            <div className="space-y-4">
              {filteredLoans.map(loan => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default LoansTabs;
