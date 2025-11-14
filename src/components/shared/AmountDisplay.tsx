import { cn } from '@/lib/utils';

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  showSign?: boolean;
  colorize?: boolean;
}

export function AmountDisplay({ 
  amount, 
  currency = 'FCFA',
  className,
  showSign = false,
  colorize = false
}: AmountDisplayProps) {
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(Math.abs(amount));

  const sign = amount >= 0 ? '+' : '-';
  const displaySign = showSign && amount !== 0 ? sign : '';

  const colorClass = colorize 
    ? amount > 0 
      ? 'text-green-600 dark:text-green-400' 
      : amount < 0 
        ? 'text-red-600 dark:text-red-400'
        : ''
    : '';

  return (
    <span className={cn('font-medium tabular-nums', colorClass, className)}>
      {displaySign}{formattedAmount} {currency}
    </span>
  );
}
