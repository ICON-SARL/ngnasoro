import React, { forwardRef, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const PinInput = forwardRef<HTMLDivElement, PinInputProps>(
  ({ value, onChange, length = 4, error, label, disabled, autoFocus, className }, ref) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus]);

    const handleChange = (index: number, digit: string) => {
      // Only allow single digit
      const sanitized = digit.replace(/\D/g, '').slice(-1);
      
      // Create new value array
      const valueArray = value.split('');
      valueArray[index] = sanitized;
      
      // Fill gaps with empty strings
      while (valueArray.length < length) {
        valueArray.push('');
      }
      
      const newValue = valueArray.join('').slice(0, length);
      onChange(newValue);
      
      // Auto-focus next input
      if (sanitized && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!value[index] && index > 0) {
          // Move to previous input if current is empty
          inputRefs.current[index - 1]?.focus();
          const valueArray = value.split('');
          valueArray[index - 1] = '';
          onChange(valueArray.join(''));
        } else {
          // Clear current input
          const valueArray = value.split('');
          valueArray[index] = '';
          onChange(valueArray.join(''));
        }
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      onChange(pasted);
      
      // Focus last filled input or next empty
      const focusIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    };

    const handleFocus = (index: number) => {
      inputRefs.current[index]?.select();
    };

    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        {label && (
          <label className="text-sm font-medium text-foreground/80 block text-center">
            {label}
          </label>
        )}
        
        <div className="flex items-center justify-center gap-3">
          {Array.from({ length }, (_, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[index] || ''}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              disabled={disabled}
              className={cn(
                "w-14 h-16 text-center text-2xl font-bold",
                "rounded-2xl border-2 transition-all duration-200",
                "bg-background/60 backdrop-blur-sm",
                "focus:outline-none focus:ring-4",
                error
                  ? "border-destructive/50 focus:border-destructive focus:ring-destructive/10"
                  : "border-border/40 focus:border-primary focus:ring-primary/10",
                disabled && "opacity-50 cursor-not-allowed bg-muted",
                value[index] && "border-primary/50 bg-primary/5"
              )}
              aria-label={`Chiffre ${index + 1}`}
            />
          ))}
        </div>
        
        {error && (
          <p className="text-sm text-destructive font-medium text-center">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PinInput.displayName = 'PinInput';

export { PinInput };
