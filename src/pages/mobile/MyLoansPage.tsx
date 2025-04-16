
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, ChevronRight, CreditCard, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';
import { useClientLoans } from '@/hooks/useClientLoans';
import { Loan } from '@/types/sfdClients';
import { TransactionHeader } from '@/components/transactions/TransactionHeader';

const MyLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans, isLoading, refetchLoans } = useClientLoans();
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [historyLoans, setHistoryLoans] = useState<Loan[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  useEffect(() => {
    // Filter active loans
    const active = loans.filter(loan => 
      loan.status === 'active' || loan.status === 'approved'
    );
    
    // Filter history loans
    const history = loans.filter(loan => 
      loan.status === 'completed' || loan.status === 'rejected' || loan.status === 'pending'
    );
    
    // Calculate total active loans amount
    const total = active.reduce((sum, loan) => sum + loan.amount, 0);
    
    setActiveLoans(active);
    setHistoryLoans(history);
    setTotalAmount(total);
  }, [loans]);
  
  const handleNewLoan = () => {
    navigate('/mobile-flow/loan-plans');
  };
  
  const handleRefresh = () => {
    refetchLoans();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approuvé</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const LoanCard = ({ loan }: { loan: Loan }) => (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow" 
      onClick={() => navigate(`/mobile-flow/loan-process/${loan.id}`)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">{loan.purpose || 'Prêt'}</h3>
            <p className="text-sm text-gray-500">
              {loan.reference || `#${loan.id.substring(0, 8)}`}
            </p>
          </div>
          {getStatusBadge(loan.status)}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 text-[#0D6A51] mr-2" />
            <span className="text-sm text-gray-500">Montant:</span>
          </div>
          <div className="text-sm font-medium text-right">
            {loan.amount.toLocaleString()} FCFA
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-[#0D6A51] mr-2" />
            <span className="text-sm text-gray-500">Durée:</span>
          </div>
          <div className="text-sm font-medium text-right">
            {loan.duration_months} mois
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-[#0D6A51] mr-2" />
            <span className="text-sm text-gray-500">Date:</span>
          </div>
          <div className="text-sm font-medium text-right">
            {formatDate(loan.created_at)}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {loan.status === 'active' ? 'Paiement mensuel:' : 'Taux d\'intérêt:'}
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-1">
              {loan.status === 'active' 
                ? `${loan.monthly_payment?.toLocaleString() || '-'} FCFA` 
                : `${loan.interest_rate}%`
              }
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <MobileLayout>
      <div className="bg-white p-4 shadow-sm flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/loans')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Mes Prêts</h1>
      </div>
      
      <div className="p-4 pb-16">
        <TransactionHeader 
          totalAmount={totalAmount}
          onRefresh={handleRefresh}
          isRefreshing={isLoading}
          currency="FCFA"
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <p className="text-gray-500">Chargement de vos prêts...</p>
          </div>
        ) : (activeLoans.length === 0 && historyLoans.length === 0) ? (
          <div className="text-center p-8 mt-4">
            <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-medium">Aucun prêt trouvé</h2>
            <p className="text-gray-500 mt-2 mb-6">
              Vous n'avez pas encore de prêt. Commencez par faire une demande.
            </p>
            <Button 
              onClick={handleNewLoan}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Demander un prêt
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            {activeLoans.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Prêts actifs</h2>
                {activeLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            )}
            
            {historyLoans.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Historique des prêts</h2>
                {historyLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            )}
            
            <div className="mt-8">
              <Button 
                onClick={handleNewLoan} 
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Demander un nouveau prêt
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MyLoansPage;
