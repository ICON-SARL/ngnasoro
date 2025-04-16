
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { useSfdLoan } from '@/hooks/useSfdLoan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import MobileNavigation from '@/components/MobileNavigation';

const LoanDetailsPage: React.FC = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const { data: loan, isLoading } = useSfdLoan(loanId || '');

  React.useEffect(() => {
    if (!hasPermission('view_loan_details')) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas la permission de voir les détails des prêts",
        variant: "destructive",
      });
      navigate('/mobile-flow/my-loans');
    }
  }, [hasPermission, navigate, toast]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!loanId) {
    return <div>Invalid loan ID.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!loan) {
    return <div>Loan not found.</div>;
  }

  // Extract SFD name safely
  const sfdName = loan.sfd_name || 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 p-0"
            onClick={() => navigate('/mobile-flow/my-loans')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Détails du prêt</h1>
            <p className="text-gray-500 text-sm">Informations complètes sur votre prêt</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>{loan.purpose}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <p className="text-sm text-gray-500">SFD</p>
              <p className="font-medium">{sfdName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Montant</p>
              <p className="font-medium">{loan.amount.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Durée</p>
              <p className="font-medium">{loan.duration_months} mois</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de création</p>
              <p className="font-medium">{formatDate(loan.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <p className="font-medium">{loan.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default LoanDetailsPage;
