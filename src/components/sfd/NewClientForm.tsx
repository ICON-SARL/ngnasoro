
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSfdClients } from '@/hooks/useSfdClients';
import { useAuth } from '@/hooks/useAuth';

interface NewClientFormProps {
  onSuccess?: () => void;
}

export const NewClientForm = ({ onSuccess }: NewClientFormProps) => {
  const { createClient, isLoading } = useSfdClients();
  const { activeSfdId } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      id_type: 'cni',
      id_number: '',
      notes: ''
    }
  });

  const onSubmit = async (data: any) => {
    if (!activeSfdId) return;
    
    try {
      await createClient.mutateAsync({
        ...data,
        // Assurez-vous que les champs vides sont définis comme null plutôt que des chaînes vides
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        id_number: data.id_number || null,
        id_type: data.id_type || null,
        notes: data.notes || null
      });
      
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
    }
  };

  const handleSelectChange = (value: string) => {
    setValue('id_type', value as "cni" | "passport" | "permis" | "autre");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name" className="required">Nom complet</Label>
        <Input
          id="full_name"
          placeholder="Nom et prénom du client"
          {...register('full_name', { required: "Le nom complet est requis" })}
        />
        {errors.full_name && (
          <p className="text-sm text-red-500">{errors.full_name.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            {...register('email', { 
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Adresse email invalide"
              }
            })}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            placeholder="+22xxxxxxxx"
            {...register('phone')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          placeholder="Adresse du client"
          {...register('address')}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id_type">Type de pièce d'identité</Label>
          <Select 
            onValueChange={handleSelectChange}
            defaultValue="cni"
          >
            <SelectTrigger>
              <SelectValue placeholder="Type de pièce d'identité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
              <SelectItem value="passport">Passeport</SelectItem>
              <SelectItem value="permis">Permis de conduire</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="id_number">Numéro de pièce d'identité</Label>
          <Input
            id="id_number"
            placeholder="Numéro de la pièce d'identité"
            {...register('id_number')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Notes additionnelles sur le client"
          {...register('notes')}
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
          {isLoading ? 'Création en cours...' : 'Créer le client'}
        </Button>
      </div>
    </form>
  );
};

export default NewClientForm;
