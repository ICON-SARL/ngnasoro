
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export const CreditTrendChart = () => {
  const { activeSfdId } = useAuth();
  
  const fetchCreditTrends = async () => {
    if (!activeSfdId) return [];
    
    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: month.toLocaleDateString('fr-FR', { month: 'short' }),
        fullDate: month.toISOString(),
        nextMonth: new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString()
      });
    }
    
    // Fetch loan data for each month
    const result = [];
    for (const period of months) {
      const { data: loans, error } = await supabase
        .from('sfd_loans')
        .select('amount, status, created_at')
        .eq('sfd_id', activeSfdId)
        .gte('created_at', period.fullDate)
        .lt('created_at', period.nextMonth);
        
      if (error) {
        console.error('Error fetching loans for trend chart:', error);
        continue;
      }
      
      const approved = loans?.filter(loan => loan.status === 'approved' || loan.status === 'active' || loan.status === 'disbursed')
        .reduce((sum, loan) => sum + (loan.amount || 0), 0) || 0;
        
      const rejected = loans?.filter(loan => loan.status === 'rejected')
        .reduce((sum, loan) => sum + (loan.amount || 0), 0) || 0;
        
      result.push({
        name: period.month,
        Accordés: Math.round(approved / 100000) / 10, // Convert to millions with 1 decimal
        Rejetés: Math.round(rejected / 100000) / 10, // Convert to millions with 1 decimal
      });
    }
    
    return result;
  };
  
  const { data: trendData, isLoading } = useQuery({
    queryKey: ['credit-trends', activeSfdId],
    queryFn: fetchCreditTrends,
    enabled: !!activeSfdId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Tendances des Crédits</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={trendData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Millions FCFA', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} M FCFA`, undefined]} />
              <Bar dataKey="Accordés" fill="#0D6A51" />
              <Bar dataKey="Rejetés" fill="#FF8A65" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
