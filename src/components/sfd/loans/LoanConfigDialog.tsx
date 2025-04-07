
import React from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface LoanConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface LoanConfigFormValues {
  minAmount: number;
  maxAmount: number;
  minDuration: number;
  maxDuration: number;
  baseRate: number;
}

const LoanConfigDialog: React.FC<LoanConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const form = useForm<LoanConfigFormValues>({
    defaultValues: {
      minAmount: 50000,
      maxAmount: 5000000,
      minDuration: 3,
      maxDuration: 36,
      baseRate: 5.5,
    }
  });

  const handleSubmit = (data: LoanConfigFormValues) => {
    console.log('Loan configuration updated:', data);
    toast({
      title: 'Configuration mise à jour',
      description: 'Les paramètres de prêt ont été enregistrés avec succès',
    });
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Configuration du Workflow de Prêt</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Montants</h4>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="minAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant minimum (FCFA)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
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
                        <FormLabel>Montant maximum (FCFA)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Durées</h4>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="minDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée minimum (mois)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
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
                        <FormLabel>Durée maximum (mois)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Taux d'intérêt</h4>
              <FormField
                control={form.control}
                name="baseRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taux de base (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Le taux de base peut être ajusté en fonction du profil de risque du client
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer la Configuration
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanConfigDialog;
