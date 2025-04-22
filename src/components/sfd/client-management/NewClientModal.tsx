
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { supabase } from '@/integrations/supabase/client';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: () => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, onClientCreated }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeSfdId } = useSfdDataAccess();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [clientData, setClientData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    id_type: '',
    id_number: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSfdId || !user) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer un client sans SFD active ou utilisateur connecté',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer un nouveau client dans la table sfd_clients
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          ...clientData,
          sfd_id: activeSfdId,
          status: 'validated',
          validated_by: user.id,
          validated_at: new Date().toISOString(),
          kyc_level: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Client créé',
        description: 'Le client a été créé avec succès',
      });

      // Tenter de créer un compte pour ce client
      try {
        await supabase.rpc('create_client_savings_account', {
          p_client_id: data.id,
          p_sfd_id: activeSfdId,
          p_initial_balance: 0
        });
      } catch (accountError) {
        console.error('Erreur lors de la création du compte:', accountError);
        // On ne bloque pas le processus même si la création du compte échoue
      }

      onClientCreated();
    } catch (error: any) {
      console.error('Erreur lors de la création du client:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création du client',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau client</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={clientData.full_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email" 
                  type="email"
                  value={clientData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={clientData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={clientData.address}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_type">Type d'identification</Label>
                <Input
                  id="id_type"
                  name="id_type"
                  value={clientData.id_type}
                  onChange={handleChange}
                  placeholder="CNI, Passeport, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="id_number">N° d'identification</Label>
                <Input
                  id="id_number"
                  name="id_number"
                  value={clientData.id_number}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Créer le client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientModal;
