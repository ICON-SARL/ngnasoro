
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export function CurrentSfdBadge() {
  const { activeSfdId } = useAuth();

  if (!activeSfdId) {
    return (
      <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
        Aucun SFD sélectionné
      </div>
    );
  }

  return (
    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
      SFD ID: {activeSfdId.substring(0, 8)}...
    </div>
  );
}
