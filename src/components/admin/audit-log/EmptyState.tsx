
import React from 'react';
import { Shield } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Shield className="h-12 w-12 text-gray-400" />
      <p className="mt-4 text-sm text-gray-600">Aucune entrée d'audit trouvée.</p>
    </div>
  );
}
