import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loanApi } from '@/utils/loanApi';
import { useToast } from '@/hooks/use-toast';

interface LoanRequestCardProps {
  loan: any; // Replace 'any' with your actual Loan type
  onLoanUpdate: () => void;
}

const LoanRequestCard: React.FC<LoanRequestCardProps> = ({ loan, onLoanUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id;

  const handleLoanAction = (loanId: string) => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié",
        variant: "destructive",
      });
      return;
    }
    loanApi.approveLoan(loanId, userId);
  };

  const handleRejectLoan = (loanId: string) => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié",
        variant: "destructive",
      });
      return;
    }
    loanApi.rejectLoan(loanId, userId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Demande de Prêt</CardTitle>
        {getStatusBadge(loan.status)}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Montant: {loan.amount}
          </p>
          <p className="text-sm text-muted-foreground">
            Client: {loan.client_id}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {loan.status === 'pending' && (
          <>
            <Button variant="outline" size="sm" onClick={() => handleRejectLoan(loan.id)}>
              <XCircle className="h-4 w-4 mr-1" />
              Rejeter
            </Button>
            <Button size="sm" onClick={() => handleLoanAction(loan.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Approuver
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default LoanRequestCard;
