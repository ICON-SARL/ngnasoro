
import React from 'react';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface EmailInputProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const EmailInput = ({ email, onChange, disabled }: EmailInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-medium text-gray-800">
        Adresse e-mail
      </Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0D6A51]" />
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          className="pl-10 h-12 border-[#0D6A51]/30 focus:border-[#0D6A51] focus:ring-[#0D6A51] rounded-xl"
          value={email}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default EmailInput;
