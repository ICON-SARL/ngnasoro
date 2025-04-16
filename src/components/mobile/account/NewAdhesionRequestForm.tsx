
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface NewAdhesionRequestFormProps {
  sfdId: string;
  onSuccess: () => void;
}

export const NewAdhesionRequestForm: React.FC<NewAdhesionRequestFormProps> = ({ 
  sfdId,
  onSuccess 
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: '',
    idType: '',
    idNumber: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          sfd_id: sfdId,
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          id_type: formData.idType,
          id_number: formData.idNumber,
          address: formData.address,
          email: user.email,
          status: 'pending'
        });

      if (error) throw error;
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting adhesion request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Nom complet</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Numéro de téléphone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="idType">Type de pièce d'identité</Label>
        <Input
          id="idType"
          value={formData.idType}
          onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="idNumber">Numéro de pièce d'identité</Label>
        <Input
          id="idNumber"
          value={formData.idNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          'Envoyer la demande'
        )}
      </Button>
    </form>
  );
};

export default NewAdhesionRequestForm;
