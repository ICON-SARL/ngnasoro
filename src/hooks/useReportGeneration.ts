
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/utils/apiClient';

type ReportFormat = 'pdf' | 'excel' | 'csv';
type ReportType = 'transactions' | 'loans' | 'subsidies' | 'sfds';

interface ReportOptions {
  type: ReportType;
  startDate: Date;
  endDate: Date;
  sfdId?: string;
  format: ReportFormat;
}

export function useReportGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReport = async (options: ReportOptions) => {
    try {
      setIsGenerating(true);
      
      const response = await apiClient.supabase.functions.invoke('generate-financial-report', {
        body: {
          type: options.type,
          startDate: options.startDate.toISOString(),
          endDate: options.endDate.toISOString(),
          sfdId: options.sfdId || null,
          format: options.format
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Use the returned URL to trigger download
      if (response.data?.url) {
        window.open(response.data.url, '_blank');
      }

      toast({
        title: 'Rapport généré avec succès',
        description: `Le rapport a été généré au format ${options.format.toUpperCase()}`,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: 'Erreur lors de la génération du rapport',
        description: error?.message || 'Une erreur s\'est produite',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportData = async (options: Omit<ReportOptions, 'format'>) => {
    try {
      setIsGenerating(true);
      
      const startDate = options.startDate.toISOString().split('T')[0];
      const endDate = options.endDate.toISOString().split('T')[0];
      
      // Fix: Use type assertion to address the TypeScript error
      // We need to make sure we're passing valid table names
      let data;
      let error;

      switch (options.type) {
        case 'transactions':
          ({ data, error } = await apiClient.supabase
            .from('transactions')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate));
          break;
        
        case 'loans':
          ({ data, error } = await apiClient.supabase
            .from('sfd_loans')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate));
          break;
        
        case 'subsidies':
          ({ data, error } = await apiClient.supabase
            .from('sfd_subsidies')
            .select('*')
            .gte('allocated_at', startDate)
            .lte('allocated_at', endDate));
          break;
        
        case 'sfds':
          ({ data, error } = await apiClient.supabase
            .from('sfds')
            .select('*, sfd_stats(*)'));
          break;
        
        default:
          ({ data, error } = await apiClient.supabase
            .from('transactions')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate));
      }

      if (error) throw error;
      
      if (options.sfdId && options.type !== 'sfds') {
        // Filter by sfdId client-side if it was provided and we're not querying sfds
        data = data?.filter(item => item.sfd_id === options.sfdId);
      }
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Erreur lors de la récupération des données',
        description: error?.message || 'Une erreur s\'est produite',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateReport,
    getReportData
  };
}
