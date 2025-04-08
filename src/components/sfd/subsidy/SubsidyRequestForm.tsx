import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { useSubsidyRequests, CreateSubsidyRequestData } from '@/hooks/useSubsidyRequests';
import { useAuth } from '@/hooks/useAuth';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const formSchema = z.object({
  amount: z.number().min(1, "Le montant doit être supérieur à 0"),
  purpose: z.string().min(5, "L'objet doit contenir au moins 5 caractères"),
  justification: z.string().min(20, "La justification doit contenir au moins 20 caractères"),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  region: z.string().optional(),
  expected_impact: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SubsidyRequestFormProps {
  onSuccess?: () => void;
}

export const SubsidyRequestForm: React.FC<SubsidyRequestFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createSubsidyRequest } = useSubsidyRequests();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      purpose: '',
      justification: '',
      priority: 'normal',
      region: '',
      expected_impact: '',
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    // Use optional chaining to safely access sfd_id
    const sfdId = user?.app_metadata?.sfd_id;
    
    if (!sfdId) {
      toast({
        title: "Erreur",
        description: "Votre compte n'est associé à aucune SFD. Veuillez contacter l'administrateur.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Utiliser l'interface CreateSubsidyRequestData pour la création
      const requestData: CreateSubsidyRequestData = {
        sfd_id: sfdId,
        amount: data.amount,
        purpose: data.purpose,
        justification: data.justification,
        priority: data.priority,
        region: data.region || undefined,
        expected_impact: data.expected_impact || undefined,
      };
      
      await createSubsidyRequest.mutateAsync(requestData);
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt MEREF a été envoyée avec succès",
      });
      
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de la demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Montant (FCFA) *</Label>
          <Input
            id="amount"
            type="number"
            {...form.register('amount', { valueAsNumber: true })}
            placeholder="Entrez le montant demandé"
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.amount.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="purpose">Objet de la demande *</Label>
          <Input
            id="purpose"
            {...form.register('purpose')}
            placeholder="Objectif de ce financement"
          />
          {form.formState.errors.purpose && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.purpose.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="justification">Justification détaillée *</Label>
          <Textarea
            id="justification"
            {...form.register('justification')}
            placeholder="Expliquez pourquoi ce financement est nécessaire et comment il sera utilisé"
            rows={4}
          />
          {form.formState.errors.justification && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.justification.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="priority">Priorité *</Label>
          <Select 
            defaultValue="normal" 
            onValueChange={(value) => form.setValue('priority', value as 'low' | 'normal' | 'high' | 'urgent')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une priorité" />
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
          <Label htmlFor="region">Région concernée</Label>
          <Input
            id="region"
            {...form.register('region')}
            placeholder="Région où les fonds seront utilisés"
          />
        </div>
        
        <div>
          <Label htmlFor="expected_impact">Impact attendu</Label>
          <Textarea
            id="expected_impact"
            {...form.register('expected_impact')}
            placeholder="Décrivez l'impact attendu de ce financement sur votre activité et la communauté"
            rows={3}
          />
        </div>
        
        <div>
          <Label>Documents justificatifs</Label>
          <div className="border-2 border-dashed rounded-md p-6 mt-2 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              Glissez-déposez vos fichiers ici ou cliquez pour télécharger
            </p>
            <p className="text-xs text-muted-foreground">
              (Fonctionnalité en développement)
            </p>
          </div>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Soumettre la demande"
        )}
      </Button>
    </form>
  );
};
