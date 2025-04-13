
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useNavigate } from 'react-router-dom';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useAuth } from '@/hooks/useAuth';

const MobileLoanApplicationForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applyForLoan, isUploading } = useClientLoans();
  
  const [formData, setFormData] = useState({
    sfd_id: '',
    amount: '',
    duration_months: '',
    purpose: '',
    supporting_documents: [] as string[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sfd_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une SFD",
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
        sfd_id: formData.sfd_id,
        amount: Number(formData.amount),
        duration_months: Number(formData.duration_months),
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
  
  // Liste fictive des SFDs disponibles
  const sfdsList = [
    { id: "sfd1", name: "Microfinance Bamako" },
    { id: "sfd2", name: "SFD Primaire" },
    { id: "sfd3", name: "Caisse Rurale" }
  ];
  
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">SFD</label>
            <Select
              value={formData.sfd_id}
              onValueChange={(value) => handleSelectChange('sfd_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une SFD" />
              </SelectTrigger>
              <SelectContent>
                {sfdsList.map((sfd) => (
                  <SelectItem key={sfd.id} value={sfd.id}>
                    {sfd.name}
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
            <label className="block text-sm font-medium mb-1">Durée (mois)</label>
            <Select
              value={formData.duration_months}
              onValueChange={(value) => handleSelectChange('duration_months', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 mois</SelectItem>
                <SelectItem value="6">6 mois</SelectItem>
                <SelectItem value="12">12 mois</SelectItem>
                <SelectItem value="24">24 mois</SelectItem>
                <SelectItem value="36">36 mois</SelectItem>
              </SelectContent>
            </Select>
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
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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

export default MobileLoanApplicationForm;
