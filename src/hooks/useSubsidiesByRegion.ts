
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubsidyByRegion {
  region: string;
  amount: number;
  type?: string;
}

export function useSubsidiesByRegion() {
  return useQuery({
    queryKey: ['subsidies-by-region'],
    queryFn: async (): Promise<SubsidyByRegion[]> => {
      // In a real implementation, we would fetch from the database
      // For now, return mock data
      
      // Try to fetch data from the database first
      try {
        const { data, error } = await supabase
          .from('sfd_subsidies')
          .select('region, amount, sfds(type)');
          
        if (!error && data && data.length > 0) {
          // Process the real data
          const processedData = data.reduce((acc, item) => {
            const region = item.region || 'Non spécifié';
            const existingRegion = acc.find(r => r.region === region);
            
            if (existingRegion) {
              existingRegion.amount += item.amount;
            } else {
              acc.push({
                region,
                amount: item.amount,
                type: item.sfds?.type
              });
            }
            
            return acc;
          }, [] as SubsidyByRegion[]);
          
          return processedData;
        }
      } catch (e) {
        console.error('Error fetching subsidy data:', e);
      }
      
      // Fall back to mock data
      return [
        { region: 'Centre', amount: 250000000, type: 'Microfinance' },
        { region: 'Nord', amount: 150000000, type: 'Coopérative' },
        { region: 'Sud', amount: 180000000, type: 'Caisse rurale' },
        { region: 'Est', amount: 120000000, type: 'Microfinance' },
        { region: 'Ouest', amount: 190000000, type: 'Coopérative' },
        { region: 'Nord-Est', amount: 90000000, type: 'Caisse rurale' },
        { region: 'Sud-Ouest', amount: 110000000, type: 'Microfinance' }
      ];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}
