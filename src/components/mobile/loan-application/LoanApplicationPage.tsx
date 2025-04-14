
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useAuth } from '@/hooks/useAuth';
import { sfdLoanApi } from '@/utils/sfdLoanApi';
import { Loader2 } from 'lucide-react';

const LoanApplicationPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applyForLoan, isUploading } = useClientLoans();
  
  const [formData, setFormData] = useState({
    loan_plan_id: '',
    amount: '',
    purpose: '',
    supporting_documents: [] as string[]
  });
  
  const [loanPlans, setLoanPlans] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchLoanPlans = async () => {
      try {
        const data = await sfdLoanApi.getSfdLoans();
        
        if (data) {
          const transformedPlans = data.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
          }));
          setLoanPlans(transformedPlans);
        }
      } catch (error) {
        console.error("Error fetching loan plans:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les plans de prêt",
          variant: "destructive",
        });
      }
    };
    
    fetchLoanPlans();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.loan_plan_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un plan de prêt",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await applyForLoan.mutateAsync({
        sfd_id: formData.loan_plan_id,
        amount: Number(formData.amount),
        duration_months: 12, // Default value
        purpose: formData.purpose,
        supporting_documents: formData.supporting_documents
      });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès",
      });
      
      navigate('/mobile-flow/my-loans');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plan de Prêt</label>
            <Select
              value={formData.loan_plan_id}
              onValueChange={(value) => handleSelectChange('loan_plan_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un plan" />
              </SelectTrigger>
              <SelectContent>
                {loanPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Montant (FCFA)</label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Exemple: 50000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Objet du prêt</label>
            <Textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Pourquoi avez-vous besoin de ce prêt?"
              rows={3}
            />
          </div>
          
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Traitement en cours...
                </span>
              ) : (
                "Soumettre la demande"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoanApplicationPage;
