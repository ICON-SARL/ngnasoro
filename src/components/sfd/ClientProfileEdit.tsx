import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SfdClient } from '@/types/sfdClients';

interface ClientProfileEditProps {
  clientId: string;
  onSaved: () => void;
  onCancel: () => void;
}

const ClientProfileEdit: React.FC<ClientProfileEditProps> = ({ clientId, onSaved, onCancel }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState<{
    full_name: string;
    email: string;
    phone: string;
    address: string;
    id_type: string;
    id_number: string;
    kyc_level: 'none' | 'basic' | 'full' | number;
    notes: string;
  }>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    id_type: '',
    id_number: '',
    kyc_level: 'none',
    notes: ''
  });

  useEffect(() => {
    const fetchClient = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) throw error;

        // Handle kyc_level
        let kycLevel: 'none' | 'basic' | 'full' | number = data.kyc_level;
        if (typeof data.kyc_level === 'number') {
          // Keep as number
          kycLevel = data.kyc_level;
        } else if (typeof data.kyc_level === 'string') {
          // Keep as string
          kycLevel = data.kyc_level as 'none' | 'basic' | 'full';
        } else {
          kycLevel = 0; // Default to 0 if undefined
        }

        setClient({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          id_type: data.id_type || '',
          id_number: data.id_number || '',
          kyc_level: kycLevel,
          notes: data.notes || ''
        });
      } catch (error: any) {
        console.error('Error fetching client:', error);
        toast({
          title: 'Erreur',
          description: error.message || 'Une erreur est survenue lors du chargement du client',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [clientId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKycLevelChange = (value: string) => {
    setClient(prev => ({
      ...prev,
      kyc_level: value as 'none' | 'basic' | 'full'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert string kyc_level to number for the database if needed
      let kycLevelToSave: number | string = client.kyc_level;
      
      // If the kyc_level is a string, convert it to a number
      if (client.kyc_level === 'none') kycLevelToSave = 0;
      else if (client.kyc_level === 'basic') kycLevelToSave = 1;
      else if (client.kyc_level === 'full') kycLevelToSave = 2;

      const { error } = await supabase
        .from('sfd_clients')
        .update({
          full_name: client.full_name,
          email: client.email || null,
          phone: client.phone || null,
          address: client.address || null,
          id_type: client.id_type || null,
          id_number: client.id_number || null,
          kyc_level: kycLevelToSave,
          notes: client.notes || null
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Profil client mis à jour avec succès',
      });

      onSaved();
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la mise à jour du client',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifier le profil client</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                type="text"
                id="full_name"
                name="full_name"
                value={client.full_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={client.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={client.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                type="text"
                id="address"
                name="address"
                value={client.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id_type">Type de pièce d'identité</Label>
                <Input
                  type="text"
                  id="id_type"
                  name="id_type"
                  value={client.id_type}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="id_number">Numéro de pièce d'identité</Label>
                <Input
                  type="text"
                  id="id_number"
                  name="id_number"
                  value={client.id_number}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="kyc_level">Niveau KYC</Label>
              <Select value={client.kyc_level} onValueChange={handleKycLevelChange}>
                <SelectTrigger id="kyc_level">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="basic">Basique</SelectItem>
                  <SelectItem value="full">Complet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={client.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                Enregistrer
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientProfileEdit;
