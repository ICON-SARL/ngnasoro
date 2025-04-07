
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sfdLoanApi } from '@/utils/sfdLoanApi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface NewLoanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoanCreated: () => void;
}

const NewLoanDialog = ({ isOpen, onClose, onLoanCreated }: NewLoanDialogProps) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      client_id: '',
      amount: '',
      duration_months: '',
      interest_rate: '5.5',
      purpose: '',
      subsidy_requested: false,
      subsidy_amount: '',
      subsidy_justification: ''
    }
  });
  
  const subsidyRequested = watch('subsidy_requested');
  
  useEffect(() => {
    if (isOpen) {
      fetchClients();
      reset();
    }
  }, [isOpen, reset]);
  
  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('id, full_name')
        .order('full_name', { ascending: true });
        
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des clients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      const loanData = {
        client_id: data.client_id,
        sfd_id: user?.sfd_id,
        amount: parseFloat(data.amount),
        duration_months: parseInt(data.duration_months),
        interest_rate: parseFloat(data.interest_rate),
        purpose: data.purpose,
        monthly_payment: calculateMonthlyPayment(
          parseFloat(data.amount), 
          parseFloat(data.interest_rate), 
          parseInt(data.duration_months)
        ),
        subsidy_amount: data.subsidy_requested ? parseFloat(data.subsidy_amount) : 0,
      };
      
      await sfdLoanApi.createLoan(loanData);
      
      toast({
        title: 'Prêt créé',
        description: 'Le prêt a été créé avec succès',
      });
      
      onLoanCreated();
      
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const calculateMonthlyPayment = (amount: number, rate: number, months: number) => {
    // Convert annual rate to monthly rate
    const monthlyRate = (rate / 100) / 12;
    
    // Calculate monthly payment using the amortization formula
    const payment = amount * (
      (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
      (Math.pow(1 + monthlyRate, months) - 1)
    );
    
    return parseFloat(payment.toFixed(2));
  };
  
  const handleClientChange = (value: string) => {
    setValue('client_id', value);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau Prêt</DialogTitle>
          <DialogDescription>
            Créez un nouveau prêt pour un client
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select onValueChange={handleClientChange}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client_id && (
              <p className="text-sm text-red-500">Le client est requis</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input 
                id="amount" 
                type="number" 
                {...register('amount', { required: true })}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">Le montant est requis</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (mois)</Label>
              <Input 
                id="duration" 
                type="number" 
                {...register('duration_months', { required: true })}
              />
              {errors.duration_months && (
                <p className="text-sm text-red-500">La durée est requise</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
            <Input 
              id="interest_rate" 
              type="number" 
              step="0.1" 
              {...register('interest_rate', { required: true })} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Objet du prêt</Label>
            <Input 
              id="purpose" 
              {...register('purpose', { required: true })}
              placeholder="Ex: Achat équipement agricole"
            />
            {errors.purpose && (
              <p className="text-sm text-red-500">L'objet du prêt est requis</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="subsidy_requested" 
                checked={subsidyRequested}
                onCheckedChange={(checked) => setValue('subsidy_requested', checked)}
              />
              <Label htmlFor="subsidy_requested">Demander une subvention</Label>
            </div>
          </div>
          
          {subsidyRequested && (
            <div className="space-y-4 border-l-2 border-primary/30 pl-4">
              <div className="space-y-2">
                <Label htmlFor="subsidy_amount">Montant de la subvention (FCFA)</Label>
                <Input 
                  id="subsidy_amount" 
                  type="number" 
                  {...register('subsidy_amount', { required: subsidyRequested })}
                />
                {errors.subsidy_amount && (
                  <p className="text-sm text-red-500">Le montant de la subvention est requis</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subsidy_justification">Justification de la subvention</Label>
                <Textarea 
                  id="subsidy_justification" 
                  {...register('subsidy_justification', { required: subsidyRequested })}
                  placeholder="Expliquez pourquoi ce prêt mérite une subvention"
                  className="resize-none h-20"
                />
                {errors.subsidy_justification && (
                  <p className="text-sm text-red-500">La justification est requise</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le prêt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLoanDialog;
