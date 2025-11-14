import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateDisplayProps {
  date: string | Date;
  format?: 'short' | 'long' | 'relative' | 'datetime';
  className?: string;
}

export function DateDisplay({ date, format: dateFormat = 'short', className }: DateDisplayProps) {
  if (!date) return null;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  let formattedDate: string;

  switch (dateFormat) {
    case 'short':
      formattedDate = format(dateObj, 'dd/MM/yyyy', { locale: fr });
      break;
    case 'long':
      formattedDate = format(dateObj, 'dd MMMM yyyy', { locale: fr });
      break;
    case 'datetime':
      formattedDate = format(dateObj, 'dd/MM/yyyy HH:mm', { locale: fr });
      break;
    case 'relative':
      formattedDate = formatDistance(dateObj, new Date(), { 
        addSuffix: true, 
        locale: fr 
      });
      break;
    default:
      formattedDate = format(dateObj, 'dd/MM/yyyy', { locale: fr });
  }

  return (
    <span className={cn('text-sm text-muted-foreground', className)}>
      {formattedDate}
    </span>
  );
}
