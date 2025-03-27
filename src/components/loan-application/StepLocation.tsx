
import React from 'react';
import { Label } from '@/components/ui/label';
import GeoAgencySelector from '../GeoAgencySelector';

const StepLocation: React.FC = () => {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Agence SFD</Label>
      <p className="text-sm text-gray-500 mb-3">Sélectionnez l'agence la plus proche pour votre demande</p>
      <GeoAgencySelector />
    </div>
  );
};

export default StepLocation;
