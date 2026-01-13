import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumCard, PremiumCardContent } from '@/components/ui/premium-card';
import AmountSlider from '@/components/mobile/loan/AmountSlider';
import DurationPills from '@/components/mobile/loan/DurationPills';
import SimulationResult from '@/components/mobile/loan/SimulationResult';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoanPlan {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  duration_months: number;
  interest_rate: number;
}

const MobileLoanSimulatorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const planId = location.state?.planId;
  
  const [plan, setPlan] = useState<LoanPlan | null>(null);
  const [amount, setAmount] = useState(500000);
  const [duration, setDuration] = useState(12);
  const [isLoading, setIsLoading] = useState(!!planId);
  
  // Default configuration (when no plan is selected)
  const defaultConfig = {
    minAmount: 100000,
    maxAmount: 2000000,
    interestRate: 10,
    durationOptions: [3, 6, 9, 12, 18, 24, 36]
  };

  // Fetch loan plan if planId is provided
  useEffect(() => {
    const fetchLoanPlan = async () => {
      if (!planId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select('*')
          .eq('id', planId)
          .single();
          
        if (error) throw error;
        
        setPlan(data);
        setAmount(data.min_amount);
        setDuration(Math.min(12, data.duration_months));
      } catch (error) {
        console.error('Erreur lors du chargement du plan de prêt:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails du plan de prêt',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoanPlan();
  }, [planId, toast]);

  // Get config from plan or defaults
  const config = useMemo(() => {
    if (plan) {
      // Generate duration options based on plan's max duration
      const maxDuration = plan.duration_months;
      const options = [3, 6, 9, 12, 18, 24, 36].filter(d => d <= maxDuration);
      if (!options.includes(maxDuration)) {
        options.push(maxDuration);
        options.sort((a, b) => a - b);
      }
      
      return {
        minAmount: plan.min_amount,
        maxAmount: plan.max_amount,
        interestRate: plan.interest_rate,
        durationOptions: options
      };
    }
    return defaultConfig;
  }, [plan]);

  // Calculate loan details
  const loanDetails = useMemo(() => {
    const rate = config.interestRate;
    // Simple interest calculation
    const totalInterest = (amount * rate * duration) / (12 * 100);
    const totalAmount = amount + totalInterest;
    const monthlyPayment = totalAmount / duration;
    
    return {
      monthlyPayment,
      totalAmount,
      totalInterest,
      interestRate: rate,
      duration,
      principal: amount
    };
  }, [amount, duration, config.interestRate]);

  const handleRequestLoan = () => {
    navigate('/mobile-flow/loan-application', {
      state: {
        planId: plan?.id,
        amount,
        duration,
        monthlyPayment: loanDetails.monthlyPayment,
        totalAmount: loanDetails.totalAmount
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {plan ? plan.name : 'Simulateur de prêt'}
            </h1>
            <p className="text-xs text-muted-foreground">Calculez vos mensualités</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-32 space-y-4">
        {/* Amount Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PremiumCard variant="glass" padding="lg">
            <PremiumCardContent className="p-0">
              <AmountSlider
                value={amount}
                min={config.minAmount}
                max={config.maxAmount}
                step={25000}
                onChange={setAmount}
              />
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        {/* Duration Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PremiumCard variant="glass" padding="md">
            <PremiumCardContent className="p-0">
              <DurationPills
                value={duration}
                options={config.durationOptions}
                onChange={setDuration}
              />
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PremiumCard variant="default" padding="lg">
            <PremiumCardContent className="p-0">
              <SimulationResult {...loanDetails} />
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-center text-muted-foreground px-4"
        >
          Cette simulation est indicative et ne constitue pas une offre de prêt.
        </motion.p>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleRequestLoan}
            className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/25"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Demander ce prêt
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MobileLoanSimulatorPage;
