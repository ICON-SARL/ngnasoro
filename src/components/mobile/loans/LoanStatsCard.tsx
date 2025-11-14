import { Loan } from '@/types/sfdClients';
import { TrendingUp, CreditCard, BarChart3 } from 'lucide-react';

interface LoanStatsCardProps {
  loans: Loan[];
}

const LoanStatsCard = ({ loans }: LoanStatsCardProps) => {
  // Calculate statistics
  const totalBorrowed = loans.reduce((sum, loan) => sum + loan.amount, 0);
  
  const activeLoansCount = loans.filter(loan => 
    loan.status === 'active' || loan.status === 'approved' || loan.status === 'disbursed'
  ).length;

  const completedLoans = loans.filter(loan => loan.status === 'completed').length;
  const totalLoans = loans.length;
  const repaymentRate = totalLoans > 0 ? (completedLoans / totalLoans) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl p-5 border border-primary/20">
      <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        Mes statistiques
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="bg-background/50 rounded-2xl p-3 mb-2">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Total emprunté</p>
          </div>
          <p className="text-sm font-bold text-foreground">
            {(totalBorrowed / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-muted-foreground">FCFA</p>
        </div>

        <div className="text-center">
          <div className="bg-background/50 rounded-2xl p-3 mb-2">
            <CreditCard className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Prêts actifs</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {activeLoansCount}
          </p>
        </div>

        <div className="text-center">
          <div className="bg-background/50 rounded-2xl p-3 mb-2">
            <BarChart3 className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Taux remb.</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(repaymentRate)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanStatsCard;
