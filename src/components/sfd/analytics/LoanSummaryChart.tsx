
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface LoanStatusCount {
  name: string;
  value: number;
  color: string;
}

interface LoanSummaryChartProps {
  sfdId: string;
}

export function LoanSummaryChart({ sfdId }: LoanSummaryChartProps) {
  const [data, setData] = useState<LoanStatusCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLoanSummary = async () => {
      if (!sfdId) {
        setData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data: loans, error } = await supabase
          .from('sfd_loans')
          .select('status')
          .eq('sfd_id', sfdId);

        if (error) throw error;

        // Count loans by status
        const statusCounts: Record<string, number> = {
          pending: 0,
          approved: 0,
          disbursed: 0,
          active: 0,
          completed: 0,
          late: 0,
          rejected: 0
        };

        loans?.forEach(loan => {
          if (statusCounts[loan.status] !== undefined) {
            statusCounts[loan.status] += 1;
          }
        });

        // Define colors for status
        const statusColors: Record<string, string> = {
          pending: '#FFB020',
          approved: '#0E9CFF',
          disbursed: '#10B981',
          active: '#06b6d4',
          completed: '#0D6A51',
          late: '#EF4444',
          rejected: '#6b7280'
        };

        // Create chart data
        const chartData = Object.entries(statusCounts)
          .filter(([_, count]) => count > 0) // Only include statuses with loans
          .map(([status, count]) => ({
            name: formatStatusName(status),
            value: count,
            color: statusColors[status] || '#6b7280'
          }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching loan summary:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoanSummary();
  }, [sfdId]);

  const formatStatusName = (status: string): string => {
    const statusNames: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuvé',
      disbursed: 'Décaissé',
      active: 'Actif',
      completed: 'Complété',
      late: 'En retard',
      rejected: 'Rejeté'
    };
    return statusNames[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
      </div>
    );
  }

  return (
    <div className="h-64">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} crédit(s)`, '']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex justify-center items-center h-full text-muted-foreground">
          Aucun crédit trouvé
        </div>
      )}
    </div>
  );
}
