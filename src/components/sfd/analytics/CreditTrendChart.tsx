
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MonthlyData {
  month: string;
  approvedCount: number;
  rejectedCount: number;
  approvedAmount: number;
  rejectedAmount: number;
}

export function CreditTrendChart() {
  const { activeSfdId } = useAuth();
  
  const fetchCreditTrends = async (): Promise<MonthlyData[]> => {
    if (!activeSfdId) return [];
    
    // Get the last 6 months
    const months: MonthlyData[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      months.push({
        month: monthName,
        approvedCount: 0,
        rejectedCount: 0,
        approvedAmount: 0,
        rejectedAmount: 0
      });
    }
    
    // Get start and end dates for our query (6 months ago to now)
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    // Fetch approved loans
    const { data: approvedLoans, error: approvedError } = await supabase
      .from('sfd_loans')
      .select('amount, approved_at')
      .eq('sfd_id', activeSfdId)
      .eq('status', 'approved')
      .gte('approved_at', startDate)
      .lte('approved_at', endDate);
      
    if (approvedError) console.error('Error fetching approved loans:', approvedError);
    
    // Fetch rejected loans
    const { data: rejectedLoans, error: rejectedError } = await supabase
      .from('sfd_loans')
      .select('amount, created_at')
      .eq('sfd_id', activeSfdId)
      .eq('status', 'rejected')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
      
    if (rejectedError) console.error('Error fetching rejected loans:', rejectedError);
    
    // Process the data
    if (approvedLoans) {
      approvedLoans.forEach(loan => {
        const loanDate = new Date(loan.approved_at);
        const monthIndex = loanDate.getMonth() - (now.getMonth() - 5);
        
        if (monthIndex >= 0 && monthIndex < 6) {
          months[monthIndex].approvedCount += 1;
          months[monthIndex].approvedAmount += Number(loan.amount) || 0;
        }
      });
    }
    
    if (rejectedLoans) {
      rejectedLoans.forEach(loan => {
        const loanDate = new Date(loan.created_at);
        const monthIndex = loanDate.getMonth() - (now.getMonth() - 5);
        
        if (monthIndex >= 0 && monthIndex < 6) {
          months[monthIndex].rejectedCount += 1;
          months[monthIndex].rejectedAmount += Number(loan.amount) || 0;
        }
      });
    }
    
    return months;
  };
  
  const { data, isLoading } = useQuery({
    queryKey: ['credit-trends', activeSfdId],
    queryFn: fetchCreditTrends,
    enabled: !!activeSfdId
  });
  
  if (isLoading || !data) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Tendances des Crédits (6 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement des données...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Tendances des Crédits (6 derniers mois)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => {
                if (name.includes('Amount')) {
                  return [new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value as number), name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="approvedCount"
              name="Crédits Approuvés"
              stroke="#0D6A51"
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="rejectedCount"
              name="Crédits Rejetés"
              stroke="#f43f5e"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
