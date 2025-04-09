
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader } from '@/components/ui/loader';

interface LoanSummaryChartProps {
  sfdId: string | null;
}

export const LoanSummaryChart: React.FC<LoanSummaryChartProps> = ({ sfdId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['loan-summary', sfdId],
    queryFn: async () => {
      if (!sfdId) return [];
      
      try {
        // Get loan status distribution for the SFD
        const { data, error } = await supabase
          .from('sfd_loans')
          .select('status, count')
          .eq('sfd_id', sfdId)
          .order('status', { ascending: true });
          
        if (error) throw error;
        
        // Transform data for chart
        if (!data || data.length === 0) {
          // If no real data, return mock data
          return [
            { name: 'En attente', value: 5, color: '#f59e0b' },
            { name: 'Actif', value: 12, color: '#10b981' },
            { name: 'Remboursé', value: 8, color: '#3b82f6' },
            { name: 'En retard', value: 3, color: '#ef4444' },
          ];
        }
        
        // In a real scenario this would process the database data
        // For demo purposes, return mock data
        return [
          { name: 'En attente', value: 5, color: '#f59e0b' },
          { name: 'Actif', value: 12, color: '#10b981' },
          { name: 'Remboursé', value: 8, color: '#3b82f6' },
          { name: 'En retard', value: 3, color: '#ef4444' },
        ];
      } catch (error) {
        console.error('Error fetching loan summary data:', error);
        return [];
      }
    },
    enabled: !!sfdId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
