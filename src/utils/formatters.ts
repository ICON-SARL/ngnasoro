
/**
 * Formats a number as currency (FCFA)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats a date string to a readable format
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Formats a date string to include time
 */
export function formatDateTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Returns a color class based on status
 */
export function getStatusColorClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'success':
    case 'completed':
    case 'approved':
    case 'validated':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'in_progress':
    case 'waiting':
      return 'bg-amber-100 text-amber-800';
    case 'suspended':
    case 'rejected':
    case 'failed':
    case 'declined':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
