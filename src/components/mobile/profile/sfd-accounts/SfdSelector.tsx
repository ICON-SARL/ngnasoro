
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';

interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
}

interface SfdSelectorProps {
  userId: string;
  onRequestSent: () => void;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ userId, onRequestSent }) => {
  const [availableSfds, setAvailableSfds] = useState<Sfd[]>([]);
  const [selectedSfdId, setSelectedSfdId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  // Fetch available SFDs that the user doesn't already have
  useEffect(() => {
    const fetchAvailableSfds = async () => {
      try {
        setIsFetching(true);
        
        // First get user's existing SFDs
        const { data: userSfds } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', userId);
        
        const userSfdIds = userSfds?.map(item => item.sfd_id) || [];
        
        // Then get all active SFDs that user doesn't already have
        const { data: sfds, error } = await supabase
          .from('sfds')
          .select('id, name, code, region')
          .eq('status', 'active')
          .not('id', 'in', `(${userSfdIds.length > 0 ? userSfdIds.join(',') : 'null'})`);
        
        if (error) throw error;
        
        setAvailableSfds(sfds || []);
      } catch (error) {
        console.error('Error fetching available SFDs:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer la liste des SFDs disponibles',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };
    
    if (userId) {
      fetchAvailableSfds();
    }
  }, [userId, toast]);

  const handleSubmitRequest = async () => {
    if (!selectedSfdId) {
      toast({
        title: 'Champ requis',
        description: 'Veuillez sélectionner une SFD',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create a client request entry
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          user_id: userId,
          sfd_id: selectedSfdId,
          full_name: '', // Will be updated from user profile
          phone: phoneNumber,
          status: 'pending',
          kyc_level: 0
        })
        .select();
        
      if (error) throw error;
      
      // Update the client with user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();
        
      if (profile) {
        await supabase
          .from('sfd_clients')
          .update({ 
            full_name: profile.full_name || 'Client' 
          })
          .eq('id', data[0].id);
      }
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande a été envoyée avec succès. Vous serez notifié lorsqu\'elle sera traitée.',
      });
      
      onRequestSent();
    } catch (error) {
      console.error('Error sending SFD request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre demande. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader size="lg" />
      </div>
    );
  }

  if (availableSfds.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">Aucune SFD disponible à ajouter.</p>
        <p className="text-sm text-gray-400 mt-2">Vous êtes déjà connecté à toutes les SFDs disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <Label htmlFor="sfd-select">Sélectionnez une SFD</Label>
        <Select 
          value={selectedSfdId} 
          onValueChange={setSelectedSfdId}
        >
          <SelectTrigger id="sfd-select">
            <SelectValue placeholder="Choisir une SFD" />
          </SelectTrigger>
          <SelectContent>
            {availableSfds.map(sfd => (
              <SelectItem key={sfd.id} value={sfd.id}>
                {sfd.name} {sfd.region ? `(${sfd.region})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Numéro de téléphone (optionnel)</Label>
        <Input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Votre numéro de téléphone"
        />
        <p className="text-xs text-gray-500">
          Votre numéro de téléphone permettra à la SFD de vous contacter plus facilement.
        </p>
      </div>
      
      <Button 
        className="w-full mt-4"
        onClick={handleSubmitRequest}
        disabled={isLoading}
      >
        {isLoading ? <Loader size="sm" className="mr-2" /> : null}
        Envoyer la demande
      </Button>
    </div>
  );
};

export default SfdSelector;
