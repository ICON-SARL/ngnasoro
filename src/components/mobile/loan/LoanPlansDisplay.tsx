import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Percent, CreditCard, ChevronRight, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface LoanPlan {
  id: string;
  sfd_id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
  created_at: string;
  is_subsidized?: boolean;
  subsidy_rate?: number;
  sfds?: {
    name: string;
    logo_url: string;
  };
}

interface SFD {
  id: string;
  name: string;
}

interface RepaymentScheduleItem {
  month: number;
  date: string;
  principal: number;
  interest: number;
  fees: number;
  total: number;
  balance: number;
}

interface LoanPlansDisplayProps {
  subsidizedOnly?: boolean;
}

import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';

export default function LoanPlansDisplay({ subsidizedOnly = false }: LoanPlansDisplayProps) {
  const { data: loanPlans, isLoading } = useSfdLoanPlans();
  const [selectedSfd, setSelectedSfd] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  const [amount, setAmount] = useState<number>(100000);
  const [duration, setDuration] = useState<number>(12);
  const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentScheduleItem[]>([]);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalRepayment, setTotalRepayment] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [sfdList, setSfdList] = useState<SFD[]>([]);

  useEffect(() => {
    const fetchUserSfds = async () => {
      if (!user) return;

      try {
        const { data: userSfds, error } = await supabase
          .from('user_sfds')
          .select('sfd_id, sfds(id, name)')
          .eq('user_id', user.id);

        if (error) throw error;

        const sfds = userSfds.map(item => ({
          id: item.sfds.id,
          name: item.sfds.name
        }));

        setSfdList(sfds);
        
        // Select first SFD by default
        // if (sfds.length > 0 && !selectedSfd) {
        //   setSelectedSfd(sfds[0].id);
        // }
      } catch (error) {
        console.error('Error fetching user SFDs:', error);
      }
    };

    fetchUserSfds();
  }, [user]);

  const filteredPlans = loanPlans?.filter(plan => 
    subsidizedOnly ? 
      plan.name.toLowerCase().includes('subvention') || 
      plan.description?.toLowerCase().includes('subvention')
    : !plan.name.toLowerCase().includes('subvention') && 
      !plan.description?.toLowerCase().includes('subvention')
  );

  useEffect(() => {
    if (selectedPlan && amount && duration) {
      calculateRepaymentSchedule();
    }
  }, [selectedPlan, amount, duration]);

  const calculateRepaymentSchedule = () => {
    if (!selectedPlan) return;

    // Monthly interest rate (annual rate divided by 12)
    const monthlyRate = (selectedPlan.interest_rate / 100) / 12;
    
    // Monthly payment using the amortization formula
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                    (Math.pow(1 + monthlyRate, duration) - 1);
    
    // Fees applied at disbursement
    const fees = amount * (selectedPlan.fees / 100);
    
    // Build amortization schedule
    let balance = amount;
    const schedule: RepaymentScheduleItem[] = [];
    let totalInterestPaid = 0;
    
    const today = new Date();
    
    for (let month = 1; month <= duration; month++) {
      // Calculate interest for this period
      const interestPayment = balance * monthlyRate;
      totalInterestPaid += interestPayment;
      
      // Calculate principal for this period
      const principalPayment = payment - interestPayment;
      
      // Update balance
      balance -= principalPayment;
      if (balance < 0) balance = 0;
      
      // Calculate payment date
      const paymentDate = new Date(today);
      paymentDate.setMonth(today.getMonth() + month);
      
      schedule.push({
        month,
        date: paymentDate.toLocaleDateString('fr-FR'),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        fees: month === 1 ? Math.round(fees) : 0, // Fees only applied on first payment
        total: Math.round(payment + (month === 1 ? fees : 0)),
        balance: Math.round(balance)
      });
    }
    
    setRepaymentSchedule(schedule);
    setMonthlyPayment(Math.round(payment));
    setTotalInterest(Math.round(totalInterestPaid));
    setTotalRepayment(Math.round(amount + totalInterestPaid + fees));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const handlePlanSelect = (plan: LoanPlan) => {
    setSelectedPlan(plan);
    
    // Set initial values based on plan constraints
    setAmount(Math.max(plan.min_amount, Math.min(amount, plan.max_amount)));
    setDuration(Math.max(plan.min_duration, Math.min(duration, plan.max_duration)));
    
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredPlans && filteredPlans.length > 0 ? (
        <div className="space-y-3">
          {filteredPlans.map(plan => (
            <Card key={plan.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {plan.sfds?.name}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={subsidizedOnly ? 
                      "bg-amber-50 border-amber-200 text-amber-700" : 
                      "bg-green-50 border-green-200 text-green-700"}
                  >
                    {plan.interest_rate}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <p className="text-gray-500">Montant</p>
                      <p className="font-medium">
                        {plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <p className="text-gray-500">Durée</p>
                      <p className="font-medium">{plan.min_duration} - {plan.max_duration} mois</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="w-full mt-4 flex justify-center items-center text-sm font-medium text-[#0D6A51] hover:bg-[#0D6A51]/5 py-2 border-t border-gray-100"
                  onClick={() => handlePlanSelect(plan)}
                >
                  Simuler ce prêt <Calculator className="h-4 w-4 ml-1" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">
            Aucun plan de prêt {subsidizedOnly ? 'subventionné' : ''} disponible
          </p>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Simulation de prêt</DialogTitle>
            <DialogDescription>
              {selectedPlan?.name}: {selectedPlan?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Montant du prêt</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={selectedPlan?.min_amount || 10000}
                  max={selectedPlan?.max_amount || 5000000}
                  step={5000}
                  className="flex-1"
                />
                <span className="text-sm">FCFA</span>
              </div>
              <Slider
                value={[amount]}
                min={selectedPlan?.min_amount || 10000}
                max={selectedPlan?.max_amount || 5000000}
                step={5000}
                onValueChange={(value) => setAmount(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(selectedPlan?.min_amount || 10000)}</span>
                <span>{formatCurrency(selectedPlan?.max_amount || 5000000)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Durée du prêt</label>
              <Select 
                value={duration.toString()} 
                onValueChange={(value) => setDuration(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une durée" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: Math.floor((selectedPlan?.max_duration || 36) / 3) }, 
                    (_, i) => (selectedPlan?.min_duration || 1) + (i * 3)
                  ).map(duration => (
                    <SelectItem key={duration} value={duration.toString()}>
                      {duration} mois
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Résumé du prêt
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Mensualité</p>
                  <p className="font-medium">{formatCurrency(monthlyPayment)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant total</p>
                  <p className="font-medium">{formatCurrency(totalRepayment)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Coût du crédit</p>
                  <p className="font-medium">{formatCurrency(totalInterest)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">TAEG</p>
                  <p className="font-medium">{selectedPlan?.interest_rate}%</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2">Échéancier de remboursement</h3>
              <div className="max-h-[200px] overflow-y-auto border rounded">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Mois</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-right">Mensualité</th>
                      <th className="p-2 text-right">Capital restant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repaymentSchedule.map((payment) => (
                      <tr key={payment.month} className="border-t">
                        <td className="p-2">{payment.month}</td>
                        <td className="p-2">{payment.date}</td>
                        <td className="p-2 text-right">{formatCurrency(payment.total)}</td>
                        <td className="p-2 text-right">{formatCurrency(payment.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </Button>
            <Button 
              variant="default"
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/mobile-flow/loan-application';
              }}
            >
              Demander ce prêt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
