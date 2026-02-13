import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { MALI_COUNTRY_CODE, MALI_FLAG_EMOJI, MALI_PHONE_PLACEHOLDER } from '@/lib/constants';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, error, label, className, disabled, ...props }, ref) => {
    
    const formatPhoneNumber = (input: string) => {
      const digits = input.replace(/\D/g, '');
      const limited = digits.slice(0, 8);
      if (limited.length <= 2) return limited;
      if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`;
      if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
      return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      onChange(formatted);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div 
          className={cn(
            "flex items-stretch rounded-2xl overflow-hidden h-[52px]",
            "bg-gray-50 dark:bg-gray-900",
            "border transition-all duration-200",
            error 
              ? "border-destructive/50 focus-within:border-destructive" 
              : "border-gray-200 dark:border-gray-700 focus-within:border-[#0D6A51] focus-within:ring-2 focus-within:ring-[#0D6A51]/10",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {/* Prefix with flag and country code */}
          <div className="flex items-center gap-2 px-4 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 select-none">
            <span className="text-lg">{MALI_FLAG_EMOJI}</span>
            <span className="font-semibold text-foreground/70 text-sm">
              {MALI_COUNTRY_CODE}
            </span>
          </div>
          
          {/* Phone input */}
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder={MALI_PHONE_PLACEHOLDER}
            className={cn(
              "flex-1 px-4 bg-transparent",
              "text-base font-medium tracking-wide",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none",
              "disabled:cursor-not-allowed"
            )}
            {...props}
          />
        </div>
        
        {error && (
          <p className="text-sm text-destructive font-medium pl-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
