
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLoanApplication } from '@/hooks/useLoanApplication';
import { useAuth } from '@/hooks/useAuth';

interface MobileLoanApplicationFormProps {
  planId?: string;
  sfdId?: string;
}

const MobileLoanApplicationForm: React.FC<MobileLoanApplicationFormProps> = ({ planId, sfdId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { loanPlans, isLoadingPlans, isUploading, submitApplication } = useLoanApplication(sfdId);
  
  const [formData, setFormData] = useState({
    amount: '',
    duration_months: '',
    purpose: '',
    loan_plan_id: planId || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Non authentifié',
        description: 'Veuillez vous connecter pour soumettre une demande de prêt',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate required fields
    if (!formData.amount || !formData.duration_months || !formData.purpose) {
      toast({
        title: 'Formulaire incomplet',
        description: 'Veuillez remplir tous les champs requis',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate amount is a number
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({
        title: 'Montant invalide',
        description: 'Le montant doit être un nombre positif',
        variant: 'destructive'
      });
      return;
    }
    
    // Get selected plan details for interest rate
    const selectedPlan = loanPlans.find(plan => plan.id === formData.loan_plan_id);
    
    try {
      setIsSubmitting(true);
      
      const result = await submitApplication({
        sfd_id: sfdId || selectedPlan?.sfd_id || '',
        loan_plan_id: formData.loan_plan_id || planId || '',
        amount: Number(formData.amount),
        duration_months: Number(formData.duration_months),
        purpose: formData.purpose,
        interest_rate: selectedPlan?.interest_rate
      });
      
      if (result.success) {
        toast({
          title: 'Demande soumise',
          description: 'Votre demande de prêt a été soumise avec succès',
        });
        navigate('/mobile-flow/loans');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <Card className="bg-white p-4 md:p-6 rounded-lg shadow mb-20">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!planId && (
          <div className="space-y-2">
            <Label htmlFor="loan_plan_id">Plan de prêt</Label>
            <Select 
              value={formData.loan_plan_id} 
              onValueChange={(value) => handleSelectChange('loan_plan_id', value)}
              disabled={isLoadingPlans || isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un plan de prêt" />
              </SelectTrigger>
              <SelectContent>
                {loanPlans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - {plan.interest_rate}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (FCFA) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Ex: 50000"
            required
            disabled={isSubmitting}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration_months">Durée (mois) *</Label>
          <Input
            id="duration_months"
            name="duration_months"
            type="number"
            value={formData.duration_months}
            onChange={handleInputChange}
            placeholder="Ex: 12"
            required
            disabled={isSubmitting}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="purpose">Objet du prêt *</Label>
          <Textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            placeholder="Ex: Achat d'équipement agricole"
            required
            disabled={isSubmitting}
            className="w-full h-24 resize-none"
          />
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            disabled={isSubmitting || isUploading}
          >
            {(isSubmitting || isUploading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              'Soumettre la demande'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MobileLoanApplicationForm;
