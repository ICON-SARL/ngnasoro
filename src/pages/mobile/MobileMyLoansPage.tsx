
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import MobileNavigation from '@/components/MobileNavigation';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const MobileMyLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: loans, isLoading, error } = useSfdLoans();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔍 MobileMyLoansPage - Debug:', {
      userId: user?.id,
      loansCount: loans?.length || 0,
      loans: loans?.map(l => ({
        id: l.id,
        purpose: l.purpose,
        amount: l.amount,
        status: l.status,
        sfd_name: l.sfds?.name
      })),
      isLoading,
      error: error?.message
    });
  }, [loans, user, isLoading, error]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Remboursé</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Handle error display
  if (error) {
    console.error("Error loading loans:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-0"
            onClick={() => navigate('/mobile-flow/main')}
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
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[#0D6A51] border-t-transparent rounded-full"></div>
          </div>
        ) : !loans || loans.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Aucun prêt trouvé</h3>
            <p className="mt-2 text-sm text-gray-500">
              Vous n'avez pas encore de prêt actif ou de demande en cours.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <Card 
                key={loan.id} 
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/mobile-flow/loan-details/${loan.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{loan.purpose}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {loan.sfds?.name || 'SFD'} • {formatDate(loan.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Montant</p>
                    <p className="font-semibold text-base">{loan.amount.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Durée</p>
                    <p className="font-semibold text-base">{loan.duration_months} mois</p>
                  </div>
                </div>

                {loan.status === 'active' && loan.remaining_amount !== undefined && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Restant :</span>
                      <span className="font-semibold text-amber-600">
                        {loan.remaining_amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-[#176455]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/mobile-flow/loan-details/${loan.id}`);
                    }}
                  >
                    Voir détails
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MobileNavigation />
    </div>
  );
};

export default MobileMyLoansPage;
