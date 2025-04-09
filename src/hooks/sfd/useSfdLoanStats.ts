
import { useState, useEffect } from 'react';

export function useSfdLoanStats(sfdId: string | undefined) {
  const [loanStats, setLoanStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    overdue: 0,
    completed: 0
  });
  
  useEffect(() => {
    if (sfdId) {
      // Mock data for demo
      setLoanStats({
        total: 87,
        active: 45,
        pending: 12,
        overdue: 8,
        completed: 22
      });
    }
  }, [sfdId]);
  
  return { loanStats };
}
