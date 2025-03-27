
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useSfdClients } from '@/hooks/useSfdClients';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

interface NewClientFormProps {
  onSuccess: () => void;
}

interface FormValues {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  id_type: string;
  id_number: string;
}

const NewClientForm = ({ onSuccess }: NewClientFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const { activeSfdId } = useAuth();
  const { createClient } = useSfdClients();
  
  const onSubmit = async (data: FormValues) => {
    if (!activeSfdId) {
      alert("Aucun SFD actif sélectionné");
      return;
    }
    
    try {
      await createClient.mutateAsync({
        sfd_id: activeSfdId,
        ...data
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nom complet <span className="text-red-500">*</span></Label>
        <Input
          id="full_name"
          {...register('full_name', { required: "Le nom complet est requis" })}
          placeholder="Nom complet du client"
          className={errors.full_name ? "border-red-500" : ""}
        />
        {errors.full_name && (
          <p className="text-xs text-red-500">{errors.full_name.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { 
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Format d'email invalide"
              }
            })}
            placeholder="Email du client"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+223 XX XX XX XX"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          {...register('address')}
          placeholder="Adresse du client"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id_type">Type de pièce d'identité</Label>
          <select
            id="id_type"
            {...register('id_type')}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Sélectionner un type</option>
            <option value="Carte d'identité">Carte d'identité</option>
            <option value="Passeport">Passeport</option>
            <option value="Permis de conduire">Permis de conduire</option>
            <option value="NINA">NINA</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="id_number">Numéro de pièce d'identité</Label>
          <Input
            id="id_number"
            {...register('id_number')}
            placeholder="Numéro de la pièce d'identité"
          />
        </div>
      </div>
      
      <div className="pt-4 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le client'}
        </Button>
      </div>
    </form>
  );
};

export default NewClientForm;
