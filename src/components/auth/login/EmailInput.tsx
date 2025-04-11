
import React from 'react';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

interface EmailInputProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  placeholder?: string;
}

const EmailInput = ({ email, onChange, disabled, placeholder = "Entrez votre email" }: EmailInputProps) => {
  return (
    <div className="relative group">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
      <Input
        id="email"
        type="email"
        placeholder={placeholder}
        className="pl-10 h-12 text-base rounded-lg border-gray-300 bg-white/90 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
        value={email}
        onChange={onChange}
        required
        disabled={disabled}
        autoComplete="email"
      />
    </div>
  );
};

export default EmailInput;
