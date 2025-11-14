import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface UltraInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  success?: boolean;
  helperText?: string;
}

export const UltraInput: React.FC<UltraInputProps> = ({
  label,
  error,
  icon,
  success,
  helperText,
  type = 'text',
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Icon */}
        {icon && (
          <motion.div 
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 smooth-transition',
              isFocused ? 'text-primary' : 'text-muted-foreground'
            )}
            animate={{ scale: isFocused ? 1.1 : 1 }}
          >
            {icon}
          </motion.div>
        )}
        
        {/* Input field */}
        <input
          type={inputType}
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 bg-background text-foreground smooth-transition',
            'focus:outline-none focus:scale-[1.01]',
            'placeholder:text-muted-foreground/50',
            icon && 'pl-12',
            isPassword && 'pr-12',
            error && 'border-destructive focus:border-destructive',
            success && 'border-success focus:border-success',
            !error && !success && 'border-input focus:border-primary',
            'font-medium', // Rendre le texte plus visible
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          {...props}
        />
        
        {/* Floating label */}
        {label && (
          <motion.label
            className={cn(
              'absolute pointer-events-none smooth-transition px-2 bg-background',
              icon ? 'left-12' : 'left-4',
              isFocused || hasValue
                ? '-top-2.5 text-xs'
                : 'top-1/2 -translate-y-1/2 text-base',
              isFocused && !error && 'text-primary',
              error && 'text-destructive',
              !isFocused && !error && 'text-muted-foreground'
            )}
            initial={false}
          >
            {label}
          </motion.label>
        )}

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground smooth-transition"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Focus ring animation */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-xl pointer-events-none',
            error ? 'ring-destructive' : success ? 'ring-success' : 'ring-primary'
          )}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: isFocused ? 0.2 : 0,
            scale: isFocused ? 1.02 : 1,
          }}
          style={{
            boxShadow: isFocused ? `0 0 0 4px currentColor` : 'none',
          }}
        />
      </div>
      
      {/* Error message with shake animation */}
      {error && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="mt-1.5 text-sm text-destructive flex items-center gap-1"
        >
          <motion.span
            animate={{ x: [0, -4, 4, -4, 4, 0] }}
            transition={{ duration: 0.4 }}
          >
            ⚠️
          </motion.span>
          {error}
        </motion.p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1.5 text-sm text-muted-foreground"
        >
          {helperText}
        </motion.p>
      )}

      {/* Success indicator */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-success"
        >
          ✓
        </motion.div>
      )}
    </div>
  );
};
