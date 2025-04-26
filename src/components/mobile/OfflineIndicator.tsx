
import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOfflineMode } from '@/hooks/useOfflineMode';

export const OfflineIndicator = () => {
  const { isOffline } = useOfflineMode();
  
  if (!isOffline) return null;
  
  return (
    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-50 text-yellow-800 rounded-full">
      <WifiOff className="h-3 w-3" />
      <span>Hors-ligne</span>
    </div>
  );
};
