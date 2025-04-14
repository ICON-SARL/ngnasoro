
import React from 'react';
import { Input } from '@/components/ui/input';
import { PHONE_FORMAT_MESSAGE } from '@/lib/constants';

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
        placeholder="+223 6X XX XX XX"
        value={value}
        onChange={onChange}
        pattern="^(\+223|00223)?[67]\d{7}$"
      />
      <p className="text-xs text-muted-foreground">
        {PHONE_FORMAT_MESSAGE}
      </p>
    </div>
  );
};

export default PhoneNumberInput;
