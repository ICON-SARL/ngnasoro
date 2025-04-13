
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollText, Clock, CheckCircle, XCircle, FileText, Plus } from 'lucide-react';
import { Loan } from '@/types/sfdClients';
import LoanCard from './LoanCard';
import EmptyLoansState from './EmptyLoansState';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  
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

  // Fonction pour obtenir le libellé du filtre actif
  const getActiveFilterLabel = () => {
    switch(tabValue) {
      case 'all': return `Tous (${loans.length})`;
      case 'pending': return `En attente (${pendingLoans})`;
      case 'approved': return `Approuvés (${approvedLoans})`;
      case 'rejected': return `Rejetés (${rejectedLoans})`;
      default: return `Tous (${loans.length})`;
    }
  };
  
  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      {isMobile ? (
        <div className="px-4 py-2">
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between bg-gray-100/80 rounded-xl h-12 px-4"
              >
                <div className="flex items-center">
                  {tabValue === 'all' && <ScrollText className="h-4 w-4 mr-2 text-gray-600" />}
                  {tabValue === 'pending' && <Clock className="h-4 w-4 mr-2 text-amber-600" />}
                  {tabValue === 'approved' && <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />}
                  {tabValue === 'rejected' && <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                  <span>{getActiveFilterLabel()}</span>
                </div>
                <svg 
                  width="15" 
                  height="15" 
                  viewBox="0 0 15 15" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-1">
                <TabsList className="grid grid-cols-1 gap-1 bg-transparent p-0">
                  <TabsTrigger 
                    value="all" 
                    className="justify-between rounded-lg p-3 data-[state=active]:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <ScrollText className="h-4 w-4 mr-2" />
                      <span>Tous</span>
                    </div>
                    <span className="text-gray-500">({loans.length})</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="pending" 
                    className="justify-between rounded-lg p-3 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>En attente</span>
                    </div>
                    <span className="text-gray-500">({pendingLoans})</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="approved" 
                    className="justify-between rounded-lg p-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
                  >
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Approuvés</span>
                    </div>
                    <span className="text-gray-500">({approvedLoans})</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="rejected" 
                    className="justify-between rounded-lg p-3 data-[state=active]:bg-red-50 data-[state=active]:text-red-600"
                  >
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      <span>Rejetés</span>
                    </div>
                    <span className="text-gray-500">({rejectedLoans})</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ) : (
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
      )}
      
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
