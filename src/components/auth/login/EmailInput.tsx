
import React from 'react';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

interface EmailInputProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const EmailInput = ({ email, onChange, disabled }: EmailInputProps) => {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium mb-1">
        Email
      </label>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          className="pl-10"
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
