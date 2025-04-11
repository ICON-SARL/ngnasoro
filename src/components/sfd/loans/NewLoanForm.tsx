
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useSfdClients } from '@/hooks/useSfdClients';
import { useAuth } from '@/hooks/useAuth';
import { UseMutationResult } from '@tanstack/react-query';

interface NewLoanFormProps {
  onSuccess: () => void;
  createLoan: UseMutationResult<any, Error, any, unknown>;
}

export function NewLoanForm({ onSuccess, createLoan }: NewLoanFormProps) {
  const { user, activeSfdId } = useAuth();
  const { clients } = useSfdClients();
  
  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    duration_months: '',
    interest_rate: '5.5', // Taux d'intérêt par défaut
    purpose: '',
    subsidy_requested: false,
    subsidy_amount: '',
    subsidy_justification: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? (value === '' ? '' : value) : value;
    setFormData({ ...formData, [name]: newValue });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculer le paiement mensuel
    const amount = parseFloat(formData.amount);
    const rate = parseFloat(formData.interest_rate) / 100 / 12; // Taux mensuel
    const periods = parseInt(formData.duration_months);
    
    // Formule du paiement mensuel: P = (Vp * r * (1 + r)^n) / ((1 + r)^n - 1)
    const monthlyPayment = (amount * rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
    
    const loanData = {
      client_id: formData.client_id,
      sfd_id: activeSfdId,
      amount: amount,
      duration_months: periods,
      interest_rate: parseFloat(formData.interest_rate),
      purpose: formData.purpose,
      monthly_payment: Math.round(monthlyPayment * 100) / 100,
      subsidy_amount: formData.subsidy_requested ? parseFloat(formData.subsidy_amount) : 0,
      subsidy_rate: formData.subsidy_requested ? (parseFloat(formData.subsidy_amount) / amount) * 100 : 0
    };
    
    try {
      await createLoan.mutateAsync(loanData);
      onSuccess();
    } catch (error) {
      // Géré par le hook useSfdLoans
      console.error('Erreur lors de la création du prêt', error);
    }
  };

  // Vérifier que les champs requis sont remplis
  const isFormValid = 
    formData.client_id !== '' &&
    formData.amount !== '' &&
    parseFloat(formData.amount) > 0 &&
    formData.duration_months !== '' &&
    parseInt(formData.duration_months) > 0 &&
    formData.interest_rate !== '' &&
    formData.purpose !== '';
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="client_id">Client</Label>
            <Select 
              onValueChange={(value) => handleSelectChange('client_id', value)}
              value={formData.client_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="amount">Montant (FCFA)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="Ex: 100000"
              value={formData.amount}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <Label htmlFor="duration_months">Durée (mois)</Label>
            <Input
              id="duration_months"
              name="duration_months"
              type="number"
              placeholder="Ex: 12"
              value={formData.duration_months}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
            <Input
              id="interest_rate"
              name="interest_rate"
              type="number"
              step="0.1"
              placeholder="Ex: 5.5"
              value={formData.interest_rate}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="purpose">Objet du prêt</Label>
            <Textarea
              id="purpose"
              name="purpose"
              placeholder="Décrivez l'utilisation prévue du prêt"
              value={formData.purpose}
              onChange={handleInputChange}
              className="h-20"
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="subsidy_requested"
              checked={formData.subsidy_requested}
              onCheckedChange={(checked) => handleSwitchChange('subsidy_requested', checked)}
            />
            <Label htmlFor="subsidy_requested">Demande de subvention</Label>
          </div>
          
          {formData.subsidy_requested && (
            <>
              <div>
                <Label htmlFor="subsidy_amount">Montant de la subvention (FCFA)</Label>
                <Input
                  id="subsidy_amount"
                  name="subsidy_amount"
                  type="number"
                  placeholder="Ex: 20000"
                  value={formData.subsidy_amount}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="subsidy_justification">Justification</Label>
                <Textarea
                  id="subsidy_justification"
                  name="subsidy_justification"
                  placeholder="Justifiez la demande de subvention"
                  value={formData.subsidy_justification}
                  onChange={handleInputChange}
                  className="h-20"
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      <Separator />
      
      <div className="flex justify-end">
        <Button variant="outline" type="button" onClick={onSuccess} className="mr-2">
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={!isFormValid || createLoan.isPending} 
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          {createLoan.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Création...
            </>
          ) : (
            'Créer le prêt'
          )}
        </Button>
      </div>
    </form>
  );
}
