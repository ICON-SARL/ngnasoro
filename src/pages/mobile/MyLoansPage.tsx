
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus } from 'lucide-react';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const MyLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans = [], isLoading } = useClientLoans();
  
  // Redirect if user is not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Handle back button press
  const handleBack = () => {
    navigate(-1);
  };
  
  // Handle new loan request
  const handleNewLoan = () => {
    navigate('/mobile-flow/loan-application');
  };
  
  // Handle loan details view
  const handleViewLoan = (loanId: string) => {
    navigate(`/mobile-flow/loan/${loanId}`);
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Approuvé</Badge>;
      case 'disbursed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Décaissé</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Actif</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejeté</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-2" 
            onClick={handleBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">Mes Prêts</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Button 
          className="w-full mb-4 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          onClick={handleNewLoan}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Demande de Prêt
        </Button>
        
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <Card key={index} className="mb-4 border-0 shadow-sm">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : loans && loans.length > 0 ? (
          // Display loans
          loans.map((loan) => (
            <Card 
              key={loan.id} 
              className="mb-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewLoan(loan.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{loan.purpose}</h3>
                    <p className="text-sm text-gray-600 mb-2">{loan.sfd_name || 'SFD'}</p>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>
                
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-600">Montant: <span className="font-medium">{loan.amount.toLocaleString()} FCFA</span></span>
                  <span className="text-gray-600">Durée: <span className="font-medium">{loan.duration_months} mois</span></span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // No loans
          <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">Vous n'avez pas encore de demandes de prêt</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLoansPage;
