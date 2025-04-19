
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useClientLoans } from '@/hooks/useClientLoans';

const ClientLoanApplication: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { applyForLoan, isUploading } = useClientLoans();
  
  const [formData, setFormData] = useState({
    sfd_id: '',
    amount: 0,
    duration_months: 0,
    purpose: '',
    supporting_documents: [] as string[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'duration_months') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    
    if (!formData.amount || formData.amount <= 0) {
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
        amount: formData.amount,
        duration_months: formData.duration_months,
        purpose: formData.purpose,
        supporting_documents: formData.supporting_documents
      });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès",
      });
      
      navigate('/client/loans');
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
    <Card>
      <CardHeader>
        <CardTitle>Demande de prêt</CardTitle>
      </CardHeader>
      <CardContent>
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
              value={formData.amount || ''}
              onChange={handleNumberChange}
              placeholder="Exemple: 50000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Durée (mois)</label>
            <Select
              value={formData.duration_months ? String(formData.duration_months) : ''}
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
              className="w-full"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
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

export default ClientLoanApplication;
