
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { useAuth } from '@/hooks/useAuth';

// Define the form schema with validation
const adhesionSchema = z.object({
  full_name: z.string().min(3, "Le nom complet est requis"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().min(8, "Numéro de téléphone invalide").optional(),
  address: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  notes: z.string().optional()
});

type AdhesionFormValues = z.infer<typeof adhesionSchema>;

export interface ClientAdhesionFormProps {
  sfdId: string;
  sfdName?: string;
  onSuccess?: () => void;
}

export const ClientAdhesionForm: React.FC<ClientAdhesionFormProps> = ({ 
  sfdId, 
  sfdName,
  onSuccess 
}) => {
  const { user } = useAuth();
  const { createAdhesionRequest } = useClientAdhesions();
  
  const defaultValues: Partial<AdhesionFormValues> = {
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
  };
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset
  } = useForm<AdhesionFormValues>({
    resolver: zodResolver(adhesionSchema),
    defaultValues
  });
  
  const onSubmit = async (data: AdhesionFormValues) => {
    try {
      // Ensure full_name is passed as required
      await createAdhesionRequest.mutateAsync({
        sfd_id: sfdId,
        full_name: data.full_name, // Now this is guaranteed to exist
        email: data.email,
        phone: data.phone,
        address: data.address,
        id_type: data.id_type,
        id_number: data.id_number,
        notes: data.notes
      });
      
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting adhesion form:", error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {sfdName && (
        <div className="mb-4 text-center">
          <h3 className="text-lg font-medium text-[#0D6A51]">Adhésion à {sfdName}</h3>
          <p className="text-sm text-gray-500">Remplissez ce formulaire pour soumettre votre demande</p>
        </div>
      )}
      
      <div>
        <Label htmlFor="full_name">Nom complet *</Label>
        <Input 
          id="full_name" 
          {...register('full_name')} 
          className={errors.full_name ? "border-red-300" : ""}
        />
        {errors.full_name && (
          <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            {...register('email')} 
            className={errors.email ? "border-red-300" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input 
            id="phone" 
            {...register('phone')} 
            className={errors.phone ? "border-red-300" : ""}
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input 
          id="address" 
          {...register('address')} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_type">Type de pièce d'identité</Label>
          <Select onValueChange={(value) => {}} defaultValue="">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner" {...register('id_type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
              <SelectItem value="passport">Passeport</SelectItem>
              <SelectItem value="voting_card">Carte d'électeur</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="id_number">Numéro de pièce</Label>
          <Input 
            id="id_number" 
            {...register('id_number')} 
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes supplémentaires</Label>
        <Input 
          id="notes" 
          {...register('notes')} 
        />
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Envoi en cours...</span>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            </>
          ) : (
            "Soumettre ma demande"
          )}
        </Button>
      </div>
    </form>
  );
};
