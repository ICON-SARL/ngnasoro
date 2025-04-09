
import { useState, useEffect } from 'react';

export function useSfdClientStats(sfdId: string | undefined) {
  const [clientStats, setClientStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    new: 0
  });
  
  useEffect(() => {
    if (sfdId) {
      // Mock data for demo
      setClientStats({
        total: 124,
        active: 98,
        inactive: 26,
        new: 12
      });
    }
  }, [sfdId]);
  
  return { clientStats };
}
