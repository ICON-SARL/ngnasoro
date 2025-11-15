import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoanScheduleItem } from '@/hooks/useLoanSchedule';
import { useNavigate } from 'react-router-dom';

interface ScheduleInstallmentItemProps {
  schedule: LoanScheduleItem;
  isLast: boolean;
  loanId: string;
}

export const ScheduleInstallmentItem: React.FC<ScheduleInstallmentItemProps> = ({
  schedule,
  isLast,
  loanId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const getStatusConfig = () => {
    switch (schedule.status) {
      case 'paid':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          badge: <Badge variant="default" className="bg-green-500">Payée</Badge>,
          color: 'border-green-200 bg-green-50'
        };
      case 'overdue':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          badge: <Badge variant="destructive">En retard ({schedule.days_overdue}j)</Badge>,
          color: 'border-red-200 bg-red-50'
        };
      case 'partially_paid':
        return {
          icon: <Clock className="h-5 w-5 text-orange-500" />,
          badge: <Badge variant="secondary" className="bg-orange-100 text-orange-800">Partiel</Badge>,
          color: 'border-orange-200 bg-orange-50'
        };
      case 'pending':
      default:
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          badge: <Badge variant="secondary">À venir</Badge>,
          color: 'border-blue-200 bg-blue-50'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const remainingAmount = schedule.total_amount - schedule.paid_amount + schedule.late_fee;
  const dueDate = new Date(schedule.due_date);
  const isPaid = schedule.status === 'paid';

  const handlePayment = () => {
    navigate(`/mobile-flow/secure-payment`, {
      state: {
        isRepayment: true,
        loanId,
        scheduleId: schedule.id,
        amount: remainingAmount,
        installmentNumber: schedule.installment_number
      }
    });
  };

  return (
    <div className={cn(
      "border-2 rounded-lg transition-all duration-200",
      statusConfig.color,
      isExpanded && "shadow-md"
    )}>
      {/* En-tête condensé */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          {/* Numéro + Timeline */}
          <div className="flex items-start gap-3">
            <div className="relative">
              {statusConfig.icon}
              {!isLast && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Échéance #{schedule.installment_number}</span>
                {statusConfig.badge}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{dueDate.toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>

              <div className="font-bold text-lg">
                {remainingAmount.toLocaleString()} FCFA
              </div>
            </div>
          </div>

          {/* Bouton expand */}
          <Button variant="ghost" size="sm" className="shrink-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Détails expandables */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
          {/* Ventilation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                Principal
              </div>
              <div className="font-semibold">{schedule.principal_amount.toLocaleString()} FCFA</div>
            </div>
            
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <DollarSign className="h-3 w-3" />
                Intérêts
              </div>
              <div className="font-semibold">{schedule.interest_amount.toLocaleString()} FCFA</div>
            </div>
          </div>

          {/* Frais de retard */}
          {schedule.late_fee > 0 && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-red-700 mb-1">
                <AlertTriangle className="h-3 w-3" />
                Frais de retard
              </div>
              <div className="font-semibold text-red-700">
                +{schedule.late_fee.toLocaleString()} FCFA
              </div>
            </div>
          )}

          {/* Montant payé */}
          {schedule.paid_amount > 0 && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="text-xs text-green-700 mb-1">Déjà payé</div>
              <div className="font-semibold text-green-700">
                {schedule.paid_amount.toLocaleString()} FCFA
              </div>
              {schedule.paid_at && (
                <div className="text-xs text-green-600 mt-1">
                  Le {new Date(schedule.paid_at).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
          )}

          {/* Solde restant après cette échéance */}
          {isPaid && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Solde restant après paiement :</span>{' '}
              {schedule.remaining_principal.toLocaleString()} FCFA
            </div>
          )}

          {/* Bouton payer */}
          {!isPaid && (
            <Button 
              onClick={handlePayment}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Payer maintenant
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
