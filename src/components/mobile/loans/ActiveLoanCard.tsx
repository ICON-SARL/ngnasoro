import { Loan } from '@/types/sfdClients';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, CreditCard, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActiveLoanCardProps {
  loan: Loan;
  onViewDetails: (loanId: string) => void;
  onRepay: (loanId: string) => void;
}

const ActiveLoanCard = ({ loan, onViewDetails, onRepay }: ActiveLoanCardProps) => {
  // Calculate progress
  const totalAmount = loan.amount * (1 + loan.interest_rate / 100);
  const paidAmount = totalAmount - (loan.amount || 0); // Simplified, should use actual payments
  const progress = (paidAmount / totalAmount) * 100;

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (loan.status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">En cours</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">Approuvé</Badge>;
      case 'disbursed':
        return <Badge className="bg-lime-500/20 text-lime-700 hover:bg-lime-500/30">Décaissé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30">En attente</Badge>;
      default:
        return <Badge variant="outline">{loan.status}</Badge>;
    }
  };

  // Truncate reference
  const shortRef = loan.reference ? `#${loan.reference.slice(0, 8)}` : `#${loan.id.slice(0, 8)}`;

  return (
    <div className="bg-gradient-to-br from-card to-card/80 rounded-3xl p-5 shadow-sm border border-border/50 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground text-lg">
            {loan.purpose || 'Prêt'}
          </h3>
          <p className="text-sm text-muted-foreground">{shortRef}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Amount Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-foreground">
            {Math.round(paidAmount).toLocaleString()}
          </span>
          <span className="text-muted-foreground">/ {Math.round(totalAmount).toLocaleString()} FCFA</span>
        </div>
        
        {/* Progress Bar */}
        <Progress value={progress} className="h-2 mt-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {Math.round(progress)}% remboursé
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Prochaine échéance</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(loan.next_payment_date)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Mensualité</p>
            <p className="text-sm font-medium text-foreground">
              {Math.round(loan.monthly_payment).toLocaleString()} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(loan.id)}
          className="flex-1 rounded-full"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Détails
        </Button>
        <Button
          size="sm"
          onClick={() => onRepay(loan.id)}
          className="flex-1 rounded-full bg-gradient-to-r from-primary to-primary/80"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Rembourser
        </Button>
      </div>
    </div>
  );
};

export default ActiveLoanCard;
