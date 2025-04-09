
import { useState, useEffect } from 'react';

interface SubsidyRequest {
  id: string;
  purpose: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface SubsidyRequestsOptions {
  status?: 'pending' | 'approved' | 'rejected';
  sfdId?: string;
}

export function useSfdSubsidyRequests(options: SubsidyRequestsOptions) {
  const [subsidyRequests, setSubsidyRequests] = useState<SubsidyRequest[]>([]);
  
  useEffect(() => {
    if (options.sfdId) {
      // Mock data for demo
      setSubsidyRequests([
        {
          id: '1',
          purpose: 'Financement projet agricole',
          amount: 500000,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          purpose: 'Achat équipement artisanal',
          amount: 250000,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }, [options.sfdId, options.status]);
  
  return { subsidyRequests };
}
