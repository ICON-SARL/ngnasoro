
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Client {
  id: string;
  full_name: string;
}

interface NewLoanFormData {
  client_id: string;
  amount: string;
  duration_months: string;
  interest_rate: string;
  purpose: string;
  subsidy_requested: boolean;
  subsidy_amount: string;
  subsidy_justification: string;
}

interface NewLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: NewLoanFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  clients: Client[];
}

const NewLoanDialog: React.FC<NewLoanDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSelectChange,
  onSubmit,
  clients
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouveau Prêt</DialogTitle>
          <DialogDescription>
            Créez un nouveau prêt pour un client. Remplissez tous les champs obligatoires.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="client_id">Client</Label>
              <Select 
                name="client_id" 
                value={formData.client_id} 
                onValueChange={(value) => onSelectChange('client_id', value)}
                required
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
            
            <div className="col-span-1">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div className="col-span-1">
              <Label htmlFor="duration_months">Durée (mois)</Label>
              <Input
                id="duration_months"
                name="duration_months"
                type="number"
                value={formData.duration_months}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div className="col-span-1">
              <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
              <Input
                id="interest_rate"
                name="interest_rate"
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="purpose">Objet du prêt</Label>
              <Textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Input
                  id="subsidy_requested"
                  name="subsidy_requested"
                  type="checkbox"
                  className="w-4 h-4"
                  checked={formData.subsidy_requested}
                  onChange={onInputChange}
                />
                <Label htmlFor="subsidy_requested">Demander une subvention du MEREF</Label>
              </div>
            </div>
            
            {formData.subsidy_requested && (
              <>
                <div className="col-span-1">
                  <Label htmlFor="subsidy_amount">Montant de la subvention (FCFA)</Label>
                  <Input
                    id="subsidy_amount"
                    name="subsidy_amount"
                    type="number"
                    value={formData.subsidy_amount}
                    onChange={onInputChange}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="subsidy_justification">Justification de la subvention</Label>
                  <Textarea
                    id="subsidy_justification"
                    name="subsidy_justification"
                    value={formData.subsidy_justification}
                    onChange={onInputChange}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer le prêt</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewLoanDialog;
