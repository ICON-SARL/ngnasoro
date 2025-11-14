import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };
  
  return (
    <div className="relative w-full">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <input
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 bg-background',
            'focus:outline-none focus:border-primary smooth-transition',
            icon && 'pl-12',
            error && 'border-destructive',
            !error && 'border-input',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          {...props}
        />
        
        {label && (
          <motion.label
            className={cn(
              'absolute left-4 pointer-events-none smooth-transition',
              icon && 'left-12',
              isFocused || hasValue
                ? 'top-0 -translate-y-1/2 text-xs bg-background px-2 text-primary'
                : 'top-1/2 -translate-y-1/2 text-base text-muted-foreground'
            )}
            initial={false}
            animate={{
              fontSize: isFocused || hasValue ? '0.75rem' : '1rem',
            }}
          >
            {label}
          </motion.label>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
