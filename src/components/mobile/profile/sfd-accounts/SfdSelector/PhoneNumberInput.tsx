
import React from 'react';
import { Input } from '@/components/ui/input';

interface PhoneNumberInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
        Numéro de téléphone (facultatif)
      </label>
      <Input
        id="phoneNumber"
        type="tel"
        placeholder="+223 00 00 00 00"
        value={value}
        onChange={onChange}
      />
      <p className="text-xs text-muted-foreground">
        Votre numéro aidera la SFD à vous identifier
      </p>
    </div>
  );
};

export default PhoneNumberInput;
