
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PurposeStepProps {
  purpose: string;
  setPurpose: (purpose: string) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

const PurposeStep: React.FC<PurposeStepProps> = ({
  purpose,
  setPurpose,
  onNext,
  onBack,
  isValid
}) => {
  const loanPurposes = [
    "Agriculture",
    "Commerce",
    "Éducation",
    "Santé",
    "Logement",
    "Transport",
    "Autre"
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-4">Objet du Prêt</h2>
      
      <div className="space-y-2">
        <Label htmlFor="loan-purpose">Catégorie</Label>
        <Select 
          value={purpose} 
          onValueChange={setPurpose}
        >
          <SelectTrigger id="loan-purpose">
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {loanPurposes.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="purpose-details">Description détaillée</Label>
        <Textarea
          id="purpose-details"
          placeholder="Décrivez en détail l'objectif de ce prêt..."
          rows={4}
          className="resize-none"
        />
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Button 
          className="flex-1" 
          onClick={onNext}
          disabled={!isValid}
        >
          Continuer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PurposeStep;
