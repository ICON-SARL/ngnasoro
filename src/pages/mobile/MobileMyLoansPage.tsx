import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const MobileMyLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: loans, isLoading, error } = useSfdLoans();

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
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Actif</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Remboursé</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card p-4 shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-0"
            onClick={() => navigate('/mobile-flow/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Mes prêts</h1>
            <p className="text-muted-foreground text-sm">Vos prêts actifs et historiques</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {!loans || loans.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Aucun prêt trouvé</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Vous n'avez pas encore de prêt actif ou de demande en cours.
            </p>
            <Button 
              onClick={() => navigate('/mobile-flow/loan-plans')}
              className="mt-4"
            >
              Demander un prêt
            </Button>
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
                    <p className="text-sm text-muted-foreground mt-1">
                      {loan.sfds?.name || 'SFD'} • {formatDate(loan.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(loan.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Montant</p>
                    <p className="font-semibold text-base">{loan.amount.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Durée</p>
                    <p className="font-semibold text-base">{loan.duration_months} mois</p>
                  </div>
                </div>

                {loan.status === 'active' && loan.remaining_amount !== undefined && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Restant :</span>
                      <span className="font-semibold text-accent">
                        {loan.remaining_amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-primary"
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
    </div>
  );
};

export default MobileMyLoansPage;
