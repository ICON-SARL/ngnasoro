
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';

export function useFinancialReports(timeRange: string = 'month') {
  const { activeSfdId } = useAuth();
  const { toast } = useToast();
  
  // Dummy data for now - in a real app, this would be fetched from the database
  const generateLoanData = () => {
    const periods = timeRange === 'week' ? 7 
      : timeRange === 'month' ? 30 
      : timeRange === 'quarter' ? 12 
      : 12;
      
    return Array.from({ length: periods }).map((_, i) => ({
      period: timeRange === 'week' ? `J${i+1}` 
        : timeRange === 'month' ? `J${i+1}` 
        : timeRange === 'quarter' ? `S${i+1}` 
        : `M${i+1}`,
      amount: 5000000 + Math.random() * 10000000,
      count: 10 + Math.floor(Math.random() * 20)
    }));
  };
  
  const generateRepaymentData = () => {
    const periods = timeRange === 'week' ? 7 
      : timeRange === 'month' ? 30 
      : timeRange === 'quarter' ? 12 
      : 12;
      
    return Array.from({ length: periods }).map((_, i) => ({
      period: timeRange === 'week' ? `J${i+1}` 
        : timeRange === 'month' ? `J${i+1}` 
        : timeRange === 'quarter' ? `S${i+1}` 
        : `M${i+1}`,
      rate: 75 + Math.random() * 25,
      onTimeRate: 70 + Math.random() * 25
    }));
  };
  
  const generateDefaultRateData = () => {
    const periods = timeRange === 'week' ? 7 
      : timeRange === 'month' ? 30 
      : timeRange === 'quarter' ? 12 
      : 12;
      
    return Array.from({ length: periods }).map((_, i) => ({
      period: timeRange === 'week' ? `J${i+1}` 
        : timeRange === 'month' ? `J${i+1}` 
        : timeRange === 'quarter' ? `S${i+1}` 
        : `M${i+1}`,
      defaultRate: 1 + Math.random() * 5,
      latePaymentRate: 5 + Math.random() * 10
    }));
  };
  
  const loanDistributionData = [
    { name: 'Agriculture', value: 35 },
    { name: 'Commerce', value: 25 },
    { name: 'Services', value: 20 },
    { name: 'Artisanat', value: 15 },
    { name: 'Autres', value: 5 },
  ];
  
  // In a real application, we would fetch data from the database
  // For now, we'll use static data
  const { data: loanData = generateLoanData(), isLoading: isLoadingLoanData } = useQuery({
    queryKey: ['financial-reports', 'loans', activeSfdId, timeRange],
    queryFn: () => generateLoanData(),
    enabled: !!activeSfdId
  });
  
  const { data: repaymentData = generateRepaymentData(), isLoading: isLoadingRepaymentData } = useQuery({
    queryKey: ['financial-reports', 'repayments', activeSfdId, timeRange],
    queryFn: () => generateRepaymentData(),
    enabled: !!activeSfdId
  });
  
  const { data: defaultRateData = generateDefaultRateData(), isLoading: isLoadingDefaultRateData } = useQuery({
    queryKey: ['financial-reports', 'defaults', activeSfdId, timeRange],
    queryFn: () => generateDefaultRateData(),
    enabled: !!activeSfdId
  });
  
  const isLoading = isLoadingLoanData || isLoadingRepaymentData || isLoadingDefaultRateData;
  
  // Export report function
  const exportReport = (reportType: string) => {
    toast({
      title: "Rapport exporté",
      description: `Le rapport ${reportType} a été exporté avec succès`
    });
  };
  
  return {
    loanData,
    repaymentData,
    defaultRateData,
    loanDistributionData,
    isLoading,
    exportReport
  };
}
