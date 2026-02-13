import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Delete, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface SecurePinPadProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

// Fisher-Yates shuffle
const shuffleArray = (arr: number[]): number[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const SecurePinPad: React.FC<SecurePinPadProps> = ({
  value,
  onChange,
  length = 4,
  error,
  title = 'Veuillez saisir votre code secret',
  subtitle,
  accentColor = '#F5A623',
}) => {
  const { trigger } = useHapticFeedback();

  // Shuffle digits once on mount
  const shuffledDigits = useMemo(() => shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), []);

  // Build 3-row grid: row1 (4 digits), row2 (4 digits), row3 (2 digits + backspace + clear)
  const rows = useMemo(() => {
    return [
      shuffledDigits.slice(0, 4),
      shuffledDigits.slice(4, 8),
      shuffledDigits.slice(8, 10),
    ];
  }, [shuffledDigits]);

  const handleDigit = useCallback((digit: number) => {
    if (value.length >= length) return;
    trigger('light');
    onChange(value + digit.toString());
  }, [value, length, onChange, trigger]);

  const handleBackspace = useCallback(() => {
    if (value.length === 0) return;
    trigger('light');
    onChange(value.slice(0, -1));
  }, [value, onChange, trigger]);

  const handleClear = useCallback(() => {
    trigger('medium');
    onChange('');
  }, [onChange, trigger]);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Title */}
      {title && (
        <p className="text-base font-medium text-foreground text-center">{title}</p>
      )}
      {subtitle && (
        <p className="text-sm text-muted-foreground text-center -mt-4">{subtitle}</p>
      )}

      {/* Dot indicators */}
      <motion.div
        className="flex items-center justify-center gap-4"
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {Array.from({ length }, (_, i) => (
          <motion.div
            key={i}
            className={cn(
              'w-5 h-5 rounded-full border-2 transition-colors duration-200',
              value[i]
                ? 'border-transparent'
                : 'border-gray-300 bg-gray-100'
            )}
            style={value[i] ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
            animate={value.length === i + 1 && value[i] ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.2 }}
          />
        ))}
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive font-medium text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Numeric keypad */}
      <div className="w-full max-w-[320px] space-y-3">
        {/* First two rows - 4 digits each */}
        {rows.slice(0, 2).map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-4 gap-3">
            {row.map((digit) => (
              <motion.button
                key={`d-${digit}`}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDigit(digit)}
                disabled={value.length >= length}
                className={cn(
                  'w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800',
                  'text-2xl font-bold text-foreground',
                  'flex items-center justify-center mx-auto',
                  'transition-colors active:bg-gray-200 dark:active:bg-gray-700',
                  'disabled:opacity-40 select-none',
                  'shadow-sm hover:shadow-md'
                )}
                aria-label={`Chiffre ${digit}`}
              >
                {digit}
              </motion.button>
            ))}
          </div>
        ))}

        {/* Third row - 2 remaining digits + backspace + clear */}
        <div className="grid grid-cols-4 gap-3">
          {rows[2].map((digit) => (
            <motion.button
              key={`d-${digit}`}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDigit(digit)}
              disabled={value.length >= length}
              className={cn(
                'w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800',
                'text-2xl font-bold text-foreground',
                'flex items-center justify-center mx-auto',
                'transition-colors active:bg-gray-200 dark:active:bg-gray-700',
                'disabled:opacity-40 select-none',
                'shadow-sm hover:shadow-md'
              )}
              aria-label={`Chiffre ${digit}`}
            >
              {digit}
            </motion.button>
          ))}

          {/* Backspace */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleBackspace}
            disabled={value.length === 0}
            className={cn(
              'w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700',
              'flex items-center justify-center mx-auto',
              'transition-colors active:bg-gray-300',
              'disabled:opacity-30 select-none',
              'shadow-sm'
            )}
            aria-label="Effacer un chiffre"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </motion.button>

          {/* Clear / Delete all */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            disabled={value.length === 0}
            className={cn(
              'w-16 h-16 rounded-full',
              'flex items-center justify-center mx-auto',
              'transition-colors',
              'disabled:opacity-30 select-none',
              'shadow-sm'
            )}
            style={{ backgroundColor: accentColor }}
            aria-label="Tout effacer"
          >
            <Delete size={24} className="text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export { SecurePinPad };
