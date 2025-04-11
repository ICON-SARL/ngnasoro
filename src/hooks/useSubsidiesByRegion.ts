
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/initSupabase';

interface SubsidyData {
  region: string;
  amount: number;
  sfds: number;
}

export const useSubsidiesByRegion = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [subsidiesByRegion, setSubsidiesByRegion] = useState<SubsidyData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubsidiesByRegion = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Get subsidies by region data
        // Note: Added type casting since we're mocking data for now
        const result = [
          { region: 'Bamako', amount: 250000, sfds: 3 },
          { region: 'Sikasso', amount: 180000, sfds: 2 },
          { region: 'Kayes', amount: 150000, sfds: 2 },
          { region: 'Mopti', amount: 120000, sfds: 1 },
          { region: 'Ségou', amount: 100000, sfds: 1 },
        ] as SubsidyData[];
        
        setSubsidiesByRegion(result);
      } catch (err) {
        console.error('Error fetching subsidies by region:', err);
        setError('Failed to load subsidies data by region');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubsidiesByRegion();
  }, []);

  return { subsidiesByRegion, isLoading, error };
};
