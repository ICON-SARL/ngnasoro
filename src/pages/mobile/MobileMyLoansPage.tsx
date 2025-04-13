
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useClientLoans } from '@/hooks/useClientLoans';
import MobileNavigation from '@/components/MobileNavigation';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

const MobileMyLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { loans, isLoading } = useClientLoans();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'completed': return <FileText className="h-5 w-5 text-blue-500" />;
      default: return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-0"
            onClick={() => navigate('/mobile-flow/loans')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Mes prêts</h1>
            <p className="text-gray-500 text-sm">Vos prêts actifs et historiques</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-[#0D6A51] border-t-transparent rounded-full"></div>
          </div>
        ) : loans && loans.length > 0 ? (
          <div className="space-y-4">
            {loans.map((loan) => (
              <Card key={loan.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{loan.purpose}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(loan.status)}
                    <span className={`ml-1 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(loan.status)} text-white`}>
                      {loan.status === 'active' ? 'Actif' : 
                       loan.status === 'pending' ? 'En attente' : 
                       loan.status === 'completed' ? 'Remboursé' : loan.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Montant</p>
                    <p className="font-medium">{loan.amount.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Durée</p>
                    <p className="font-medium">{loan.duration_months} mois</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/mobile-flow/loan-details', { state: { loanId: loan.id } })}
                  >
                    Voir les détails
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <FileText className="h-12 w-12 text-gray-300" />
            </div>
            <h2 className="text-lg font-medium mb-2">Aucun prêt trouvé</h2>
            <p className="text-gray-500 mb-4">Vous n'avez pas encore demandé de prêt.</p>
            <Button 
              onClick={() => navigate('/mobile-flow/loan-application')}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              Demander un prêt
            </Button>
          </div>
        )}
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileMyLoansPage;
