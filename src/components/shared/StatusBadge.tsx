import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'defaulted'
  | 'open' | 'closed' | 'validated'
  | 'success' | 'failed' | 'cancelled'
  | 'in_progress' | 'has_discrepancies';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: string; className: string }> = {
  // Loan statuses
  pending: { label: 'En attente', variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  approved: { label: 'Approuvé', variant: 'default', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  active: { label: 'Actif', variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  completed: { label: 'Complété', variant: 'default', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  rejected: { label: 'Rejeté', variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  defaulted: { label: 'Défaillant', variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  
  // Cash session statuses
  open: { label: 'Ouverte', variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  closed: { label: 'Fermée', variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  validated: { label: 'Validée', variant: 'default', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  
  // Transaction statuses
  success: { label: 'Succès', variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  failed: { label: 'Échoué', variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  cancelled: { label: 'Annulé', variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  
  // Reconciliation statuses
  in_progress: { label: 'En cours', variant: 'secondary', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  has_discrepancies: { label: 'Écarts détectés', variant: 'destructive', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  };

  return (
    <Badge 
      variant={config.variant as any}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
