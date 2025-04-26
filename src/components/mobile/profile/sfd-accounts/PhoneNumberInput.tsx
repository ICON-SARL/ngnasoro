
import React from 'react';
import { Input } from '@/components/ui/input';
import { PHONE_FORMAT_MESSAGE, validateMaliPhoneNumber, normalizeMaliPhoneNumber } from '@/lib/constants';

interface PhoneNumberInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ 
  value, 
  onChange, 
  onValidationChange 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Normalize input
    const normalizedValue = normalizeMaliPhoneNumber(inputValue);
    
    // Check validation
    const isValid = validateMaliPhoneNumber(normalizedValue);
    
    // Call onChange with the normalized value
    onChange({ ...e, target: { ...e.target, value: normalizedValue } });
    
    // Optionally notify parent about validation state
    onValidationChange?.(isValid);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
        Numéro de téléphone
      </label>
      <Input
        id="phoneNumber"
        type="tel"
        placeholder="+223 6X XX XX XX"
        value={value}
        onChange={handleChange}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        {PHONE_FORMAT_MESSAGE}
      </p>
    </div>
  );
};

export default PhoneNumberInput;
