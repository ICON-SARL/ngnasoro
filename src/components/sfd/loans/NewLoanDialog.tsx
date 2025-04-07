
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/AuthContext';
import { sfdLoanApi } from '@/utils/sfdLoanApi';

interface NewLoanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoanCreated: () => void;
}

interface LoanFormData {
  client_id: string;
  amount: string;
  duration_months: string;
  interest_rate: string;
  purpose: string;
  subsidy_requested: boolean;
  subsidy_amount: string;
  subsidy_justification: string;
}

const NewLoanDialog: React.FC<NewLoanDialogProps> = ({
  isOpen,
  onClose,
  onLoanCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Array<{ id: string; full_name: string }>>([]);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<LoanFormData>({
    defaultValues: {
      client_id: '',
      amount: '',
      duration_months: '12',
      interest_rate: '5.5',
      purpose: '',
      subsidy_requested: false,
      subsidy_amount: '',
      subsidy_justification: ''
    }
  });

  const subsidy_requested = form.watch('subsidy_requested');

  useEffect(() => {
    // Fetch clients for the select dropdown
    const fetchClients = async () => {
      // In a real app, this would fetch from the API
      // For now, use dummy data
      setClients([
        { id: 'client1', full_name: 'Aissatou Diallo' },
        { id: 'client2', full_name: 'Mamadou Sy' },
        { id: 'client3', full_name: 'Fatou Ndiaye' },
        { id: 'client4', full_name: 'Ibrahim Sow' },
      ]);
    };

    fetchClients();
  }, []);

  const handleSubmit = async (data: LoanFormData) => {
    try {
      setLoading(true);
      
      // Calculate monthly payment
      const amount = parseFloat(data.amount);
      const rate = parseFloat(data.interest_rate) / 100 / 12; // Monthly interest rate
      const duration = parseInt(data.duration_months);
      
      // Calculate monthly payment using the formula for an amortizing loan
      let monthlyPayment = 0;
      if (rate === 0) {
        // Special case: no interest
        monthlyPayment = amount / duration;
      } else {
        // Standard formula with interest
        monthlyPayment = (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1);
      }
      
      // Create loan data
      const loanData = {
        client_id: data.client_id,
        sfd_id: user?.app_metadata?.sfd_id || '',
        amount: amount,
        duration_months: duration,
        interest_rate: parseFloat(data.interest_rate),
        purpose: data.purpose,
        monthly_payment: monthlyPayment,
        subsidy_amount: data.subsidy_requested ? parseFloat(data.subsidy_amount) : 0,
      };
      
      await sfdLoanApi.createLoan(loanData);
      
      toast({
        title: 'Prêt créé',
        description: 'La demande de prêt a été créée avec succès',
      });
      
      onLoanCreated();
      
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la demande de prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Demande de Prêt</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              rules={{ required: "Veuillez sélectionner un client" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                rules={{ 
                  required: "Ce champ est requis",
                  min: {
                    value: 10000,
                    message: "Le montant minimum est de 10,000 FCFA"
                  },
                  max: {
                    value: 5000000,
                    message: "Le montant maximum est de 5,000,000 FCFA"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (FCFA)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="250000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration_months"
                rules={{ 
                  required: "Ce champ est requis"
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (mois)</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Durée du prêt" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[3, 6, 12, 18, 24, 36].map((months) => (
                          <SelectItem key={months} value={months.toString()}>
                            {months} mois
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="interest_rate"
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taux d'intérêt (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="5.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purpose"
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objet du prêt</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Objet du prêt" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Éducation">Éducation</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Fonds de roulement">Fonds de roulement</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="subsidy_requested"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Subvention demandée</FormLabel>
                    <FormDescription>
                      Demander une subvention du MEREF pour ce prêt
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {subsidy_requested && (
              <>
                <FormField
                  control={form.control}
                  name="subsidy_amount"
                  rules={{ required: subsidy_requested ? "Ce champ est requis" : false }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant de la subvention (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Montant de la subvention demandée au MEREF
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subsidy_justification"
                  rules={{ required: subsidy_requested ? "Ce champ est requis" : false }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Justification de la subvention</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Expliquez pourquoi ce client devrait bénéficier d'une subvention..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Création...' : 'Créer la demande'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLoanDialog;
