
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CreditData = {
  month: string;
  approved: number;
  rejected: number;
};

export function CreditTrendChart() {
  const { activeSfdId } = useAuth();
  
  const fetchCreditTrendData = async (): Promise<CreditData[]> => {
    if (!activeSfdId) return [];
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Get approved loans data for the current year
    const { data: approvedLoans, error: approvedError } = await supabase
      .from('sfd_loans')
      .select('created_at, amount')
      .eq('sfd_id', activeSfdId)
      .eq('status', 'approved')
      .gte('created_at', `${currentYear}-01-01`)
      .lte('created_at', `${currentYear}-12-31`);
      
    if (approvedError) {
      console.error('Error fetching approved loans:', approvedError);
      return [];
    }
    
    // Get rejected loans data for the current year
    const { data: rejectedLoans, error: rejectedError } = await supabase
      .from('sfd_loans')
      .select('created_at, amount')
      .eq('sfd_id', activeSfdId)
      .eq('status', 'rejected')
      .gte('created_at', `${currentYear}-01-01`)
      .lte('created_at', `${currentYear}-12-31`);
      
    if (rejectedError) {
      console.error('Error fetching rejected loans:', rejectedError);
      return [];
    }
    
    // Process data by month
    const monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
      'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    
    const monthlyData: CreditData[] = monthNames.map((month, index) => {
      const monthNumber = index + 1;
      
      // Filter loans for this month
      const approvedForMonth = approvedLoans?.filter(loan => {
        const loanDate = new Date(loan.created_at);
        return loanDate.getMonth() + 1 === monthNumber && loanDate.getFullYear() === currentYear;
      }) || [];
      
      const rejectedForMonth = rejectedLoans?.filter(loan => {
        const loanDate = new Date(loan.created_at);
        return loanDate.getMonth() + 1 === monthNumber && loanDate.getFullYear() === currentYear;
      }) || [];
      
      // Calculate totals
      const approvedTotal = approvedForMonth.reduce((sum, loan) => sum + (loan.amount || 0), 0);
      const rejectedTotal = rejectedForMonth.reduce((sum, loan) => sum + (loan.amount || 0), 0);
      
      return {
        month,
        approved: approvedTotal,
        rejected: rejectedTotal
      };
    });
    
    return monthlyData;
  };
  
  const { data: creditData = [], isLoading } = useQuery({
    queryKey: ['credit-trend', activeSfdId, new Date().getFullYear()],
    queryFn: fetchCreditTrendData,
    enabled: !!activeSfdId
  });
  
  // Calculate visibility of each month
  const visibleMonths = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return creditData.slice(0, currentMonth + 1);
  }, [creditData]);
  
  // Custom tooltip formatter
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);
  };
  
  // Filter months with data
  const hasData = visibleMonths.some(item => item.approved > 0 || item.rejected > 0);
  
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Tendance des Crédits (Année en cours)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Aucune donnée disponible pour cette année
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={visibleMonths} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => {
                  // Ensure value is a string for includes check
                  return String(value);
                }}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip 
                formatter={(value: number) => formatTooltipValue(value)}
                labelFormatter={(value) => `Mois: ${value}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="approved" 
                name="Crédits Approuvés" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.3} 
                stackId="1"
              />
              <Area 
                type="monotone" 
                dataKey="rejected" 
                name="Crédits Rejetés" 
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.3} 
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default CreditTrendChart;
