
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

interface SubsidyRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SubsidyRequestDialog: React.FC<SubsidyRequestDialogProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Demande de Prêt MEREF</DialogTitle>
          <DialogDescription>
            Demandez un prêt auprès du MEREF pour financer vos activités à taux réduit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="amount">Montant demandé (FCFA)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="purpose">Objet du prêt</Label>
              <Select name="purpose" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un objet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="women_empowerment">Autonomisation des femmes</SelectItem>
                  <SelectItem value="youth_employment">Emploi des jeunes</SelectItem>
                  <SelectItem value="small_business">Petites entreprises</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="region">Région ciblée</Label>
              <Select name="region" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dakar">Dakar</SelectItem>
                  <SelectItem value="thies">Thiès</SelectItem>
                  <SelectItem value="saint_louis">Saint-Louis</SelectItem>
                  <SelectItem value="ziguinchor">Ziguinchor</SelectItem>
                  <SelectItem value="kaolack">Kaolack</SelectItem>
                  <SelectItem value="nationwide">Nationale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="justification">Justification</Label>
              <Textarea
                id="justification"
                name="justification"
                placeholder="Expliquez pourquoi ce prêt est nécessaire et comment il sera utilisé..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="expected_impact">Impact attendu</Label>
              <Textarea
                id="expected_impact"
                name="expected_impact"
                placeholder="Décrivez l'impact social et économique attendu de ce prêt..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Soumettre la demande</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubsidyRequestDialog;
