import { LoanPlan } from '@/types/sfdClients';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Percent, Wallet } from 'lucide-react';

interface LoanPlanCardProps {
  plan: LoanPlan;
  onRequest: (plan: LoanPlan) => void;
}

const LoanPlanCard = ({ plan, onRequest }: LoanPlanCardProps) => {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-3xl p-5 border border-primary/10 hover:border-primary/30 transition-all">
      {/* Plan Name */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground text-lg mb-1">
            {plan.name}
          </h3>
          {plan.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {plan.description}
            </p>
          )}
        </div>
      </div>

      {/* Plan Details Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Wallet className="h-3 w-3 text-primary" />
            <p className="text-xs text-muted-foreground">Montant</p>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {(plan.min_amount / 1000).toFixed(0)}K - {(plan.max_amount / 1000).toFixed(0)}K
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="h-3 w-3 text-primary" />
            <p className="text-xs text-muted-foreground">Durée</p>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {plan.duration_months} mois
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Percent className="h-3 w-3 text-primary" />
            <p className="text-xs text-muted-foreground">Taux</p>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {plan.interest_rate}%
          </p>
        </div>
      </div>

      {/* Request Button */}
      <Button
        onClick={() => onRequest(plan)}
        className="w-full rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
      >
        Demander
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default LoanPlanCard;
