
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollText, Clock, CheckCircle, XCircle, FileText, Plus } from 'lucide-react';
import { Loan } from '@/types/sfdClients';
import LoanCard from './LoanCard';
import EmptyLoansState from './EmptyLoansState';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  const pendingLoans = loans.filter(loan => loan.status === 'pending').length;
  const approvedLoans = loans.filter(loan => loan.status === 'approved' || loan.status === 'active').length;
  const rejectedLoans = loans.filter(loan => loan.status === 'rejected').length;
  
  const filteredLoans = loans.filter(loan => {
    if (tabValue === 'all') return true;
    if (tabValue === 'pending') return loan.status === 'pending';
    if (tabValue === 'approved') return loan.status === 'approved' || loan.status === 'active';
    if (tabValue === 'rejected') return loan.status === 'rejected';
    return true;
  });
  
  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      <TabsList className="grid grid-cols-4 bg-gray-100/80 p-2 m-4 rounded-xl w-auto">
        <TabsTrigger 
          value="all" 
          className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-[#0D6A51] data-[state=active]:shadow-sm"
        >
          <ScrollText className="h-3.5 w-3.5 mr-1.5 md:hidden" />
          <span className="md:mr-1">Tous</span> 
          <span className="text-gray-500">({loans.length})</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="pending" 
          className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
        >
          <Clock className="h-3.5 w-3.5 mr-1.5 md:hidden" />
          <span className="md:mr-1">En attente</span>
          <span className="text-gray-500">({pendingLoans})</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="approved" 
          className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1.5 md:hidden" />
          <span className="md:mr-1">Approuvés</span>
          <span className="text-gray-500">({approvedLoans})</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="rejected" 
          className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
        >
          <XCircle className="h-3.5 w-3.5 mr-1.5 md:hidden" />
          <span className="md:mr-1">Rejetés</span>
          <span className="text-gray-500">({rejectedLoans})</span>
        </TabsTrigger>
      </TabsList>
      
      <div className="p-4">
        <TabsContent value={tabValue} className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl shadow-sm p-8">
              <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-800">Aucune demande de prêt</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Vous n'avez pas encore de demande de prêt. Commencez par en créer une.
              </p>
              {canApplyForLoan && (
                <Button 
                  onClick={() => navigate('/loans/apply')}
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Faire une demande
                </Button>
              )}
            </div>
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
