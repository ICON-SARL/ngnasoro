
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface LoanPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: any;
  onSaved?: () => void;
}

// Define schema for form validation
const loanPlanSchema = z.object({
  name: z.string().min(1, "Le nom du plan est requis"),
  description: z.string().optional(),
  minAmount: z.coerce.number().min(1, "Le montant minimum doit être supérieur à 0"),
  maxAmount: z.coerce.number().min(1, "Le montant maximum doit être supérieur à 0"),
  minDuration: z.coerce.number().min(1, "La durée minimum doit être d'au moins 1 mois"),
  maxDuration: z.coerce.number().min(1, "La durée maximum doit être d'au moins 1 mois"),
  interestRate: z.coerce.number().min(0, "Le taux d'intérêt ne peut pas être négatif"),
  fees: z.coerce.number().min(0, "Les frais de dossier ne peuvent pas être négatifs"),
  repaymentType: z.enum(["fixed", "decreasing"], {
    required_error: "Veuillez sélectionner un type de remboursement",
  }),
  isActive: z.boolean().default(true),
  requirements: z.string().optional(),
});

type LoanPlanFormValues = z.infer<typeof loanPlanSchema>;

const LoanPlanDialog: React.FC<LoanPlanDialogProps> = ({ 
  isOpen, 
  onClose, 
  planToEdit, 
  onSaved 
}) => {
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [sfdBalance, setSfdBalance] = useState<number | null>(null);
  const [merefLimits, setMerefLimits] = useState<{maxInterestRate: number} | null>(null);
  const [newRequirement, setNewRequirement] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<LoanPlanFormValues>({
    resolver: zodResolver(loanPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      minAmount: 10000,
      maxAmount: 1000000,
      minDuration: 1,
      maxDuration: 12,
      interestRate: 5,
      fees: 1,
      repaymentType: "fixed" as const,
      isActive: true,
      requirements: '',
    }
  });

  // Fetch SFD operation account balance and MEREF limits on component mount
  useEffect(() => {
    const fetchConstraints = async () => {
      if (!activeSfdId) return;
      
      try {
        // Fetch operation account balance
        const { data: accountData, error: accountError } = await supabase
          .from('sfd_accounts')
          .select('balance')
          .eq('sfd_id', activeSfdId)
          .eq('account_type', 'operation')
          .single();
          
        if (accountError) throw accountError;
        if (accountData) setSfdBalance(accountData.balance);
        
        // Fetch MEREF settings for interest rate limit
        const { data: merefData, error: merefError } = await supabase
          .from('meref_settings')
          .select('max_interest_rate')
          .single();
          
        if (merefError) throw merefError;
        if (merefData) setMerefLimits({ maxInterestRate: merefData.max_interest_rate || 15 });
      } catch (error) {
        console.error('Error fetching constraints:', error);
      }
    };
    
    fetchConstraints();
  }, [activeSfdId]);

  // Update form when editing a plan
  useEffect(() => {
    if (planToEdit) {
      form.reset({
        name: planToEdit.name || '',
        description: planToEdit.description || '',
        minAmount: planToEdit.min_amount || 10000,
        maxAmount: planToEdit.max_amount || 1000000,
        minDuration: planToEdit.min_duration || 1,
        maxDuration: planToEdit.max_duration || 12,
        interestRate: planToEdit.interest_rate || 5,
        fees: planToEdit.fees || 1,
        repaymentType: planToEdit.repayment_type || "fixed",
        isActive: planToEdit.is_active || true,
        requirements: planToEdit.requirements ? planToEdit.requirements.join('\n') : '',
      });
      
      setRequirements(planToEdit.requirements || []);
    } else {
      form.reset({
        name: '',
        description: '',
        minAmount: 10000,
        maxAmount: 1000000,
        minDuration: 1,
        maxDuration: 12,
        interestRate: 5,
        fees: 1,
        repaymentType: "fixed" as const,
        isActive: true,
        requirements: '',
      });
      
      setRequirements([]);
    }
  }, [planToEdit, isOpen, form]);

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };
  
  const handleRemoveRequirement = (index: number) => {
    const updated = [...requirements];
    updated.splice(index, 1);
    setRequirements(updated);
  };

  // Generate amortization schedule based on loan parameters
  const generateAmortizationSchedule = (amount: number, interestRate: number, durationMonths: number, repaymentType: string) => {
    const monthlyInterestRate = interestRate / 100 / 12;
    const schedule = [];
    
    if (repaymentType === "fixed") {
      // Fixed installment calculation (PMT formula)
      const monthlyPayment = amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, durationMonths) 
                           / (Math.pow(1 + monthlyInterestRate, durationMonths) - 1);
      
      let remainingPrincipal = amount;
      
      for (let month = 1; month <= durationMonths; month++) {
        const interestPayment = remainingPrincipal * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingPrincipal -= principalPayment;
        
        schedule.push({
          month,
          payment: monthlyPayment,
          principalPayment,
          interestPayment,
          remainingPrincipal: Math.max(0, remainingPrincipal),
        });
      }
    } else if (repaymentType === "decreasing") {
      // Decreasing installment calculation
      const principalPayment = amount / durationMonths;
      
      let remainingPrincipal = amount;
      
      for (let month = 1; month <= durationMonths; month++) {
        const interestPayment = remainingPrincipal * monthlyInterestRate;
        const payment = principalPayment + interestPayment;
        remainingPrincipal -= principalPayment;
        
        schedule.push({
          month,
          payment,
          principalPayment,
          interestPayment,
          remainingPrincipal: Math.max(0, remainingPrincipal),
        });
      }
    }
    
    return schedule;
  };

  const onSubmit = async (values: LoanPlanFormValues) => {
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Identifiant SFD manquant",
        variant: "destructive"
      });
      return;
    }
    
    // Validate min/max amounts
    if (values.minAmount > values.maxAmount) {
      toast({
        title: "Erreur",
        description: "Le montant minimum ne peut pas être supérieur au montant maximum",
        variant: "destructive"
      });
      return;
    }
    
    // Validate min/max durations
    if (values.minDuration > values.maxDuration) {
      toast({
        title: "Erreur",
        description: "La durée minimum ne peut pas être supérieure à la durée maximum",
        variant: "destructive"
      });
      return;
    }
    
    // Check interest rate against MEREF limits
    if (merefLimits && values.interestRate > merefLimits.maxInterestRate) {
      toast({
        title: "Erreur",
        description: `Le taux d'intérêt ne peut pas dépasser la limite légale de ${merefLimits.maxInterestRate}%`,
        variant: "destructive"
      });
      return;
    }
    
    // Check against SFD operation account balance
    if (sfdBalance !== null && !planToEdit && values.maxAmount > sfdBalance) {
      toast({
        title: "Avertissement",
        description: `Le montant maximum dépasse le solde du compte d'opération (${sfdBalance.toLocaleString()} FCFA)`,
        variant: "warning"
      });
      // Note: This is just a warning, not blocking the creation
    }
    
    setIsSaving(true);
    
    try {
      // Process requirements
      const requirementsArray = requirements.length > 0 ? requirements : 
        values.requirements ? values.requirements
          .split('\n')
          .map(req => req.trim())
          .filter(req => req.length > 0) : [];
      
      const planData = {
        name: values.name,
        description: values.description || '',
        min_amount: values.minAmount,
        max_amount: values.maxAmount,
        min_duration: values.minDuration,
        max_duration: values.maxDuration,
        interest_rate: values.interestRate,
        repayment_type: values.repaymentType,
        fees: values.fees,
        is_active: values.isActive,
        requirements: requirementsArray,
        sfd_id: activeSfdId
      };
      
      let result;
      
      if (planToEdit) {
        // Update existing plan
        result = await supabase
          .from('sfd_loan_plans')
          .update(planData)
          .eq('id', planToEdit.id);
      } else {
        // Create new plan
        result = await supabase
          .from('sfd_loan_plans')
          .insert(planData);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: planToEdit ? "Plan modifié" : "Plan créé",
        description: planToEdit 
          ? `Le plan "${values.name}" a été modifié avec succès`
          : `Le plan "${values.name}" a été créé avec succès`,
      });
      
      if (onSaved) onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving loan plan:', error);
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder le plan de prêt: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {planToEdit ? 'Modifier le plan de prêt' : 'Nouveau plan de prêt'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du plan *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ex: Prêt Express"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Description du plan de prêt"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant min (FCFA)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          min="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant max (FCFA)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          min="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée min (mois)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          min="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée max (mois)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          min="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taux d'intérêt (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          min="0"
                          step="0.1"
                        />
                      </FormControl>
                      {merefLimits && (
                        <p className="text-xs text-muted-foreground">
                          Limite légale: {merefLimits.maxInterestRate}%
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frais de dossier (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          min="0"
                          step="0.1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="repaymentType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type de remboursement</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <Label htmlFor="fixed">Mensualités fixes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="decreasing" id="decreasing" />
                          <Label htmlFor="decreasing">Mensualités dégressives</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>Conditions requises (une par ligne)</Label>
                <div className="flex space-x-2">
                  <Input 
                    value={newRequirement} 
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Ex: Carte d'identité valide"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddRequirement}>
                    Ajouter
                  </Button>
                </div>
                
                {requirements.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{req}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveRequirement(index)}
                        >
                          ✕
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md p-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Plan actif
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : planToEdit ? 'Mettre à jour' : 'Créer le plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanPlanDialog;
