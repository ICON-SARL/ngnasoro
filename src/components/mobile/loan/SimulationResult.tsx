import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calculator, Percent, Calendar } from 'lucide-react';

interface SimulationResultProps {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  interestRate: number;
  duration: number;
  principal: number;
}

const SimulationResult: React.FC<SimulationResultProps> = ({
  monthlyPayment,
  totalAmount,
  totalInterest,
  interestRate,
  duration,
  principal
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount));
  };

  const interestPercentage = (totalInterest / totalAmount) * 100;

  return (
    <div className="space-y-6">
      {/* Monthly Payment - Hero */}
      <div className="text-center py-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
        <p className="text-sm text-muted-foreground mb-2">Mensualité estimée</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={monthlyPayment}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-baseline justify-center gap-2"
          >
            <span className="text-4xl font-bold text-primary tracking-tight">
              {formatCurrency(monthlyPayment)}
            </span>
            <span className="text-base text-primary/70 font-medium">FCFA/mois</span>
          </motion.div>
        </AnimatePresence>
        
        {/* Progress Bar */}
        <div className="mt-4 px-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Capital</span>
            <span>Intérêts</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${100 - interestPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-primary font-medium">{(100 - interestPercentage).toFixed(0)}%</span>
            <span className="text-muted-foreground">{interestPercentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <DetailCard
          icon={<Calculator className="h-4 w-4" />}
          label="Total à rembourser"
          value={`${formatCurrency(totalAmount)} FCFA`}
        />
        <DetailCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Coût du crédit"
          value={`${formatCurrency(totalInterest)} FCFA`}
          highlight
        />
        <DetailCard
          icon={<Percent className="h-4 w-4" />}
          label="Taux d'intérêt"
          value={`${interestRate}%`}
        />
        <DetailCard
          icon={<Calendar className="h-4 w-4" />}
          label="Nombre d'échéances"
          value={`${duration} mois`}
        />
      </div>
    </div>
  );
};

interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value, highlight }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`
      p-3 rounded-xl border
      ${highlight 
        ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' 
        : 'bg-card border-border'
      }
    `}
  >
    <div className={`flex items-center gap-1.5 mb-1 ${highlight ? 'text-amber-600' : 'text-muted-foreground'}`}>
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className={`text-sm font-semibold ${highlight ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>
      {value}
    </p>
  </motion.div>
);

export default SimulationResult;
