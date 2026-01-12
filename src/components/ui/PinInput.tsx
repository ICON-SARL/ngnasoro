import React, { forwardRef, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    }, [autoFocus]);

    const handleChange = (index: number, digit: string) => {
      const sanitized = digit.replace(/\D/g, '').slice(-1);
      const valueArray = value.split('');
      valueArray[index] = sanitized;
      
      while (valueArray.length < length) {
        valueArray.push('');
      }
      
      const newValue = valueArray.join('').slice(0, length);
      onChange(newValue);
      
      if (sanitized && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!value[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
          const valueArray = value.split('');
          valueArray[index - 1] = '';
          onChange(valueArray.join(''));
        } else {
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
      const focusIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    };

    const handleFocus = (index: number) => {
      inputRefs.current[index]?.select();
    };

    const isFilled = value.length === length;

    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        {label && (
          <label className="text-sm font-medium text-foreground block text-center">
            {label}
          </label>
        )}
        
        <div className="flex items-center justify-center gap-3">
          {Array.from({ length }, (_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <input
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
                  "rounded-xl border-2 transition-all duration-200",
                  "bg-background shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  error
                    ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                    : value[index]
                      ? "border-primary/60 bg-primary/5 focus:border-primary focus:ring-primary/20"
                      : "border-border focus:border-primary focus:ring-primary/20",
                  disabled && "opacity-50 cursor-not-allowed bg-muted"
                )}
                style={{
                  caretColor: 'transparent'
                }}
                aria-label={`Chiffre ${index + 1}`}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center gap-1.5">
          {Array.from({ length }, (_, index) => (
            <motion.div
              key={index}
              className={cn(
                "h-1 w-6 rounded-full transition-colors duration-200",
                value[index] ? "bg-primary" : "bg-muted"
              )}
              animate={{ 
                scale: value[index] ? 1 : 0.8,
                opacity: value[index] ? 1 : 0.5
              }}
            />
          ))}
        </div>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive font-medium text-center"
          >
            {error}
          </motion.p>
        )}
        
        {isFilled && !error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-primary font-medium text-center"
          >
            ✓ Code complet
          </motion.p>
        )}
      </div>
    );
  }
);

PinInput.displayName = 'PinInput';

export { PinInput };
