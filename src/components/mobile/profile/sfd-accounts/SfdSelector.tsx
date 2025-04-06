
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/ui/loader';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';
import { AvailableSfd } from './types/SfdAccountTypes';
import { MapPin, Building } from 'lucide-react';

interface SfdSelectorProps {
  userId: string;
  onRequestSent: () => void;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ userId, onRequestSent }) => {
  const [selectedSfdId, setSelectedSfdId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { availableSfds, isLoading, requestSfdAccess } = useAvailableSfds(userId);

  const handleSubmitRequest = async () => {
    if (!selectedSfdId) {
      return; // Select validation is handled by the UI
    }

    const success = await requestSfdAccess(selectedSfdId, phoneNumber);
    if (success) {
      onRequestSent();
    }
  };

  if (isLoading) {
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
              <SelectItem key={sfd.id} value={sfd.id} className="flex items-center py-2">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{sfd.name}</span>
                  {sfd.region && (
                    <span className="ml-2 text-xs text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {sfd.region}
                    </span>
                  )}
                </div>
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
        disabled={isLoading || !selectedSfdId}
      >
        {isLoading ? <Loader size="sm" className="mr-2" /> : null}
        Envoyer la demande
      </Button>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-700">
          Après avoir envoyé votre demande, l'administrateur de la SFD devra la valider.
          Vous recevrez une notification lorsque votre demande sera traitée.
        </p>
      </div>
    </div>
  );
};

export default SfdSelector;
