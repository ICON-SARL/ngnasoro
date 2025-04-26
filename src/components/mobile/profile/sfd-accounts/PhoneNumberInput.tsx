
import React from 'react';
import { Input } from '@/components/ui/input';
import { PHONE_FORMAT_MESSAGE, validateMaliPhoneNumber, normalizeMaliPhoneNumber } from '@/lib/constants';

interface PhoneNumberInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ 
  value, 
  onChange, 
  onValidationChange,
  placeholder = "+223 6X XX XX XX",
  disabled = false,
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Let the raw input pass through to parent component
    onChange(e);
    
    // Also validate the input for feedback
    const isValid = !inputValue || validateMaliPhoneNumber(inputValue);
    
    // Optionally notify parent about validation state
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
        Numéro de téléphone{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        id="phoneNumber"
        type="tel"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full"
        disabled={disabled}
        required={required}
      />
      <p className="text-xs text-muted-foreground">
        {PHONE_FORMAT_MESSAGE}
      </p>
    </div>
  );
};

export default PhoneNumberInput;
