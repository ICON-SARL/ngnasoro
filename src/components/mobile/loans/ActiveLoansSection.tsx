
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { Loan } from '@/types/sfdClients';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';

interface ActiveLoansSectionProps {
  activeLoans: Loan[];
  isLoading: boolean;
  onViewAll: () => void;
  onNewLoan: () => void;
}

const ActiveLoansSection: React.FC<ActiveLoansSectionProps> = ({ 
  activeLoans, 
  isLoading, 
  onViewAll, 
  onNewLoan 
}) => {
  const navigate = useNavigate();
  
  // Calculate the progress and remaining amount for each loan
  const calculateLoanMetrics = (loan: Loan) => {
    const totalAmount = loan.amount * (1 + loan.interest_rate/100);
    
    // For this demo, let's determine paid amount based on sample data
    // In a real app, this would come from payment records
    const paidAmount = loan.status === 'completed' 
      ? totalAmount 
      : totalAmount * 0.4; // Assuming 40% has been paid for active loans
    
    const remainingAmount = totalAmount - paidAmount;
    const progress = Math.round((paidAmount / totalAmount) * 100);
    
    return {
      paidAmount,
      remainingAmount,
      progress
    };
  };
  
  // Format next payment date
  const formatNextPaymentDate = (date?: string) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR');
  };
  
  // View loan details
  const viewLoanDetails = (loanId: string) => {
    navigate('/mobile-flow/loan-details', { state: { loanId } });
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Mes prêts actifs</h2>
        <Button 
          variant="ghost" 
          className="text-[#0D6A51] p-0 h-auto"
          onClick={onViewAll}
        >
          Voir tous <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-4 flex justify-center">
          <div className="animate-spin h-6 w-6 border-4 border-[#0D6A51] border-t-transparent rounded-full"></div>
        </div>
      ) : activeLoans.length > 0 ? (
        <>
          {activeLoans.map(loan => {
            const { progress, remainingAmount } = calculateLoanMetrics(loan);
            return (
              <Card key={loan.id} className="border-0 shadow-sm mb-3">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-medium">{loan.purpose || 'Microfinance Bamako'}</p>
                      <p className="text-xs text-gray-500">
                        Prochain paiement: {formatNextPaymentDate(loan.next_payment_date)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(loan.amount)}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Remboursé: {progress}%</span>
                    <span>Reste: {formatCurrency(remainingAmount)}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => viewLoanDetails(loan.id)}
                  >
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </>
      ) : (
        <Card className="border-0 shadow-sm mb-3 text-center p-6">
          <p className="text-gray-500 mb-4">Vous n'avez pas de prêts actifs pour le moment.</p>
        </Card>
      )}
      
      <Button 
        variant="outline" 
        className="w-full bg-white border-dashed border-gray-300 text-gray-500"
        onClick={onNewLoan}
      >
        <Plus className="h-4 w-4 mr-2" />
        Nouveau prêt
      </Button>
    </div>
  );
};

export default ActiveLoansSection;
