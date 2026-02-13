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
  const rows = useMemo(() => [
    shuffledDigits.slice(0, 4),
    shuffledDigits.slice(4, 8),
    shuffledDigits.slice(8, 10),
  ], [shuffledDigits]);

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

  const DigitButton = useCallback(({ digit }: { digit: number }) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.15 }}
      onClick={() => handleDigit(digit)}
      disabled={value.length >= length}
      className={cn(
        'w-14 h-14 rounded-full',
        'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'text-xl font-bold text-gray-900 dark:text-gray-100',
        'flex items-center justify-center mx-auto',
        'active:bg-gray-200 dark:active:bg-gray-700',
        'disabled:opacity-40 select-none',
        'will-change-transform'
      )}
      aria-label={`Chiffre ${digit}`}
    >
      {digit}
    </motion.button>
  ), [handleDigit, value.length, length]);

  return (
    <div className="flex flex-col items-center space-y-5">
      {/* Title */}
      {title && (
        <p className="text-base font-medium text-gray-900 dark:text-gray-100 text-center">{title}</p>
      )}
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center -mt-3">{subtitle}</p>
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
              'w-4 h-4 rounded-full border-2 transition-colors duration-200',
              value[i] ? 'border-transparent' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
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
          className="text-sm text-red-600 dark:text-red-400 font-medium text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Numeric keypad */}
      <div className="w-full max-w-[300px] space-y-2.5">
        {/* First two rows */}
        {rows.slice(0, 2).map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-4 gap-2.5">
            {row.map((digit) => (
              <DigitButton key={`d-${digit}`} digit={digit} />
            ))}
          </div>
        ))}

        {/* Third row */}
        <div className="grid grid-cols-4 gap-2.5">
          {rows[2].map((digit) => (
            <DigitButton key={`d-${digit}`} digit={digit} />
          ))}

          {/* Backspace */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={handleBackspace}
            disabled={value.length === 0}
            className={cn(
              'w-14 h-14 rounded-full',
              'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
              'flex items-center justify-center mx-auto',
              'active:bg-gray-200 dark:active:bg-gray-600',
              'disabled:opacity-30 select-none will-change-transform'
            )}
            aria-label="Effacer un chiffre"
          >
            <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
          </motion.button>

          {/* Clear */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={handleClear}
            disabled={value.length === 0}
            className={cn(
              'w-14 h-14 rounded-full',
              'flex items-center justify-center mx-auto',
              'disabled:opacity-30 select-none will-change-transform'
            )}
            style={{ backgroundColor: accentColor }}
            aria-label="Tout effacer"
          >
            <Delete size={22} className="text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export { SecurePinPad };
