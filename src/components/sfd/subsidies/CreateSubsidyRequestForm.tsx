
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CreateSubsidyRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  sfdId: string;
}

const CreateSubsidyRequestForm: React.FC<CreateSubsidyRequestFormProps> = ({ 
  onSuccess,
  onCancel,
  sfdId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createSubsidyRequest } = useSubsidyRequests();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      amount: '',
      purpose: '',
      priority: 'normal',
      region: '',
      justification: '',
      expected_impact: ''
    }
  });

  const onSubmit = async (data: any) => {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour soumettre une demande",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createSubsidyRequest.mutateAsync({
        sfd_id: sfdId,
        amount: parseFloat(data.amount),
        purpose: data.purpose,
        priority: data.priority,
        region: data.region,
        justification: data.justification,
        expected_impact: data.expected_impact
      });

      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été soumise avec succès",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting subsidy request:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Montant demandé (FCFA) <span className="text-red-500">*</span></Label>
          <Input
            id="amount"
            type="number"
            placeholder="Ex: 5000000"
            {...register("amount", { 
              required: "Le montant est requis", 
              min: { value: 50000, message: "Le montant minimum est de 50,000 FCFA" },
              max: { value: 100000000, message: "Le montant maximum est de 100,000,000 FCFA" }
            })}
            className={errors.amount ? "border-red-500" : ""}
          />
          {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount.message as string}</p>}
        </div>
        
        <div>
          <Label htmlFor="purpose">Objet du prêt <span className="text-red-500">*</span></Label>
          <Select 
            onValueChange={(value) => setValue('purpose', value)} 
            defaultValue={watch('purpose')}
          >
            <SelectTrigger className={errors.purpose ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionner un objet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agriculture">Agriculture</SelectItem>
              <SelectItem value="women_empowerment">Autonomisation des femmes</SelectItem>
              <SelectItem value="youth_employment">Emploi des jeunes</SelectItem>
              <SelectItem value="small_business">Petites entreprises</SelectItem>
              <SelectItem value="microfinance">Expansion des activités de microfinance</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
          {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose.message as string}</p>}
        </div>
        
        <div>
          <Label htmlFor="region">Région ciblée <span className="text-red-500">*</span></Label>
          <Select 
            onValueChange={(value) => setValue('region', value)} 
            defaultValue={watch('region')}
          >
            <SelectTrigger className={errors.region ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionner une région" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dakar">Dakar</SelectItem>
              <SelectItem value="thies">Thiès</SelectItem>
              <SelectItem value="saint_louis">Saint-Louis</SelectItem>
              <SelectItem value="ziguinchor">Ziguinchor</SelectItem>
              <SelectItem value="kaolack">Kaolack</SelectItem>
              <SelectItem value="ouagadougou">Ouagadougou</SelectItem>
              <SelectItem value="abidjan">Abidjan</SelectItem>
              <SelectItem value="lome">Lomé</SelectItem>
              <SelectItem value="nationwide">Nationale</SelectItem>
            </SelectContent>
          </Select>
          {errors.region && <p className="text-sm text-red-500 mt-1">{errors.region.message as string}</p>}
        </div>
        
        <div>
          <Label htmlFor="priority">Priorité</Label>
          <Select 
            onValueChange={(value) => setValue('priority', value as 'low' | 'normal' | 'high' | 'urgent')} 
            defaultValue={watch('priority')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Basse</SelectItem>
              <SelectItem value="normal">Normale</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="justification">Justification <span className="text-red-500">*</span></Label>
          <Textarea
            id="justification"
            placeholder="Expliquez pourquoi ce prêt est nécessaire et comment il sera utilisé..."
            {...register("justification", { 
              required: "La justification est requise",
              minLength: { value: 50, message: "La justification doit contenir au moins 50 caractères" } 
            })}
            className={errors.justification ? "border-red-500" : ""}
          />
          {errors.justification && <p className="text-sm text-red-500 mt-1">{errors.justification.message as string}</p>}
        </div>
        
        <div>
          <Label htmlFor="expected_impact">Impact attendu <span className="text-red-500">*</span></Label>
          <Textarea
            id="expected_impact"
            placeholder="Décrivez l'impact social et économique attendu de ce prêt..."
            {...register("expected_impact", { 
              required: "L'impact attendu est requis",
              minLength: { value: 50, message: "L'impact attendu doit contenir au moins 50 caractères" } 
            })}
            className={errors.expected_impact ? "border-red-500" : ""}
          />
          {errors.expected_impact && <p className="text-sm text-red-500 mt-1">{errors.expected_impact.message as string}</p>}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Soumission en cours...
            </>
          ) : (
            'Soumettre la demande'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateSubsidyRequestForm;
