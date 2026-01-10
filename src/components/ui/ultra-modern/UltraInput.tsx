import React, { useState, useEffect } from 'react';
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
  const [hasValue, setHasValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Synchroniser hasValue avec props.value
  useEffect(() => {
    const currentValue = props.value !== undefined ? props.value : props.defaultValue;
    setHasValue(!!currentValue && String(currentValue).length > 0);
  }, [props.value, props.defaultValue]);
  
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
              'absolute left-3.5 top-1/2 -translate-y-1/2 smooth-transition',
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
            'w-full px-4 py-4 rounded-2xl border bg-white dark:bg-gray-900 text-foreground text-base transition-all duration-300 ease-premium',
            'min-h-[56px]',
            'focus:outline-none focus:ring-2 focus:ring-primary/15',
            'placeholder:text-muted-foreground/50',
            icon && 'pl-12',
            isPassword && 'pr-12',
            error && 'border-destructive/50 focus:border-destructive focus:ring-destructive/15',
            success && 'border-emerald-400/50 focus:border-emerald-500',
            !error && !success && 'border-border/60 focus:border-primary/50',
            'font-medium',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          placeholder={!label || (isFocused || hasValue) ? props.placeholder : ''}
          {...props}
        />
        
        {/* Floating label */}
        {label && (
          <motion.label
            className={cn(
              'absolute pointer-events-none px-2 font-medium transition-all duration-300 ease-premium',
              'bg-white dark:bg-gray-900 rounded',
              icon ? 'left-11' : 'left-3',
              isFocused || hasValue
                ? '-top-2.5 text-xs'
                : 'top-1/2 -translate-y-1/2 text-sm',
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

        {/* Focus ring animation - softer */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-2xl pointer-events-none',
            error ? 'ring-destructive' : success ? 'ring-emerald-500' : 'ring-primary'
          )}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isFocused ? 0.08 : 0,
          }}
          style={{
            boxShadow: isFocused ? `0 0 0 3px currentColor` : 'none',
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
