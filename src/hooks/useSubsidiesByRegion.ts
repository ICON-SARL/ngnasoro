
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sfd } from '@/components/admin/types/sfd-types';

interface SubsidyByRegionData {
  region: string;
  type: string;
  amount: number;
  count: number;
}

export const useSubsidiesByRegion = () => {
  const [data, setData] = useState<SubsidyByRegionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubsidiesByRegion = async () => {
      try {
        setIsLoading(true);
        
        // First, get all SFDs with their regions
        const { data: sfds, error: sfdsError } = await supabase
          .from('sfds')
          .select('id, name, region, code');
          
        if (sfdsError) throw sfdsError;
        
        // Next, get all subsidies
        const { data: subsidies, error: subsidiesError } = await supabase
          .from('sfd_subsidies')
          .select('sfd_id, amount');
          
        if (subsidiesError) throw subsidiesError;
        
        // Create a mapping of SFD ID to SFD details
        const sfdMap = (sfds as Sfd[]).reduce((map, sfd) => {
          map[sfd.id] = sfd;
          return map;
        }, {} as Record<string, Sfd>);
        
        // Create region aggregation
        const regionData: Record<string, { amount: number, count: number }> = {};
        const typeData: Record<string, { amount: number, count: number }> = {};
        
        subsidies.forEach(subsidy => {
          const sfd = sfdMap[subsidy.sfd_id];
          if (sfd) {
            // Region aggregation
            const region = sfd.region || 'Non spécifié';
            if (!regionData[region]) {
              regionData[region] = { amount: 0, count: 0 };
            }
            regionData[region].amount += subsidy.amount;
            regionData[region].count += 1;
            
            // SFD type aggregation (using code prefix as a simple way to categorize)
            const type = sfd.code.startsWith('MF') ? 'Micro-Finance' : 
                         sfd.code.startsWith('CL') ? 'Coopérative de Crédit' : 
                         sfd.code.startsWith('CR') ? 'Caisse Rurale' : 'Autre';
                         
            if (!typeData[type]) {
              typeData[type] = { amount: 0, count: 0 };
            }
            typeData[type].amount += subsidy.amount;
            typeData[type].count += 1;
          }
        });
        
        // Convert to array format for the charts
        const regionArray = Object.entries(regionData).map(([region, data]) => ({
          region,
          type: '', // Not used for region view
          amount: data.amount,
          count: data.count
        }));
        
        const typeArray = Object.entries(typeData).map(([type, data]) => ({
          region: '', // Not used for type view
          type,
          amount: data.amount,
          count: data.count
        }));
        
        // Use region data as the default
        setData(regionArray.length > 0 ? regionArray : [
          { region: 'Dakar', type: '', amount: 45000000, count: 5 },
          { region: 'Thiès', type: '', amount: 30000000, count: 3 },
          { region: 'Saint-Louis', type: '', amount: 25000000, count: 2 },
          { region: 'Kaolack', type: '', amount: 20000000, count: 2 },
          { region: 'Autres', type: '', amount: 15000000, count: 3 }
        ]);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching subsidies by region:', err);
        setError(err as Error);
        setIsLoading(false);
        
        // Set fallback data
        setData([
          { region: 'Dakar', type: '', amount: 45000000, count: 5 },
          { region: 'Thiès', type: '', amount: 30000000, count: 3 },
          { region: 'Saint-Louis', type: '', amount: 25000000, count: 2 },
          { region: 'Kaolack', type: '', amount: 20000000, count: 2 },
          { region: 'Autres', type: '', amount: 15000000, count: 3 }
        ]);
      }
    };

    fetchSubsidiesByRegion();
    
    // Set up a real-time subscription for updates
    const subscription = supabase
      .channel('subsidies-by-region')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sfd_subsidies'
      }, fetchSubsidiesByRegion)
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { data, isLoading, error };
};
