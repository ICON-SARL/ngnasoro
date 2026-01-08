import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSfdLoan } from '@/hooks/useSfdLoan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LoanDetailsPage: React.FC = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: loan, isLoading, error } = useSfdLoan(loanId || '');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!loanId) {
    return <div className="p-4 text-center">ID de prêt invalide.</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">
      Erreur lors du chargement des données du prêt.
    </div>;
  }

  if (!loan) {
    return <div className="p-4 text-center">Prêt non trouvé.</div>;
  }

  const sfdName = loan.sfd_name || loan.sfds?.name || 'N/A';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card p-4 shadow-sm">
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
            <p className="text-muted-foreground text-sm">Informations complètes</p>
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
              <p className="text-sm text-muted-foreground">SFD</p>
              <p className="font-medium">{sfdName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="font-medium">{loan.amount?.toLocaleString('fr-FR') || 0} FCFA</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durée</p>
              <p className="font-medium">{loan.duration_months} mois</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de création</p>
              <p className="font-medium">{formatDate(loan.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <p className="font-medium capitalize">{loan.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoanDetailsPage;
