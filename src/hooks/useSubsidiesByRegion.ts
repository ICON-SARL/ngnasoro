
import { useState, useEffect } from 'react';

export interface SubsidyData {
  region: string;
  type: string;
  amount: number;
}

export function useSubsidiesByRegion() {
  const [subsidiesByRegion, setSubsidiesByRegion] = useState<SubsidyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubsidies = async () => {
      try {
        // This would be a real API call in production
        // For now, we'll use mock data
        setTimeout(() => {
          const mockData: SubsidyData[] = [
            { region: 'Kayes', type: 'Microfinance', amount: 25000000 },
            { region: 'Koulikoro', type: 'Coopérative', amount: 18000000 },
            { region: 'Sikasso', type: 'Microfinance', amount: 30000000 },
            { region: 'Ségou', type: 'Caisse Rurale', amount: 15000000 },
            { region: 'Mopti', type: 'Microfinance', amount: 22000000 },
            { region: 'Tombouctou', type: 'Coopérative', amount: 12000000 },
            { region: 'Gao', type: 'Caisse Rurale', amount: 10000000 }
          ];
          
          setSubsidiesByRegion(mockData);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching subsidies data:', err);
        setError('Failed to load subsidies data');
        setIsLoading(false);
      }
    };

    fetchSubsidies();
  }, []);

  return {
    data: subsidiesByRegion, // Added this to fix the error
    subsidiesByRegion,
    isLoading,
    error
  };
}
