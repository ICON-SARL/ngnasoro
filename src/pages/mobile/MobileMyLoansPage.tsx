
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import MobileNavigation from '@/components/MobileNavigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const MobileMyLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: loans, isLoading, error } = useSfdLoans();
  const { user } = useAuth();
  const { toast } = useToast();

  // Remove the permission check that was causing the access denied message
  // Instead of checking for a specific permission, we'll just fetch the loans directly
  // and handle the case where there are no loans gracefully

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
              <Card key={loan.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{loan.purpose}</h3>
                    <p className="text-sm text-gray-500">
                      {loan.sfds?.name || 'SFD'} - {formatDate(loan.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className="font-medium">{loan.amount.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <p className="font-medium">{loan.duration_months} mois</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/mobile-flow/loan-details/${loan.id}`)}
                  >
                    Voir les détails
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
