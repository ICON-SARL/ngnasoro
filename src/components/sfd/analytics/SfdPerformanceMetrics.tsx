
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader } from '@/components/ui/loader';

interface SfdPerformanceMetricsProps {
  sfdId: string | null;
}

export const SfdPerformanceMetrics: React.FC<SfdPerformanceMetricsProps> = ({ sfdId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['sfd-performance', sfdId],
    queryFn: async () => {
      if (!sfdId) return null;
      
      try {
        // In a real app, fetch performance metrics from the database
        // For now, return mock data
        return {
          loanRepaymentRate: 92, // 92%
          clientRetentionRate: 86, // 86%
          avgLoanProcessingTime: 2.3, // 2.3 days
          riskScore: 78 // 78/100
        };
      } catch (error) {
        console.error('Error fetching SFD performance metrics:', error);
        return null;
      }
    },
    enabled: !!sfdId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader size="md" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Aucune donnée de performance disponible
      </div>
    );
  }

  const metrics = [
    {
      name: "Taux de remboursement",
      value: data.loanRepaymentRate,
      goal: 95,
      color: data.loanRepaymentRate >= 90 ? "bg-green-500" : "bg-amber-500"
    },
    {
      name: "Rétention clients",
      value: data.clientRetentionRate,
      goal: 85,
      color: data.clientRetentionRate >= 85 ? "bg-green-500" : "bg-amber-500"
    },
    {
      name: "Score de risque",
      value: data.riskScore,
      goal: 75,
      color: data.riskScore >= 75 ? "bg-green-500" : "bg-amber-500"
    }
  ];

  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{metric.name}</span>
            <span className="font-medium">
              {metric.value}% <span className="text-muted-foreground text-xs">/ objectif {metric.goal}%</span>
            </span>
          </div>
          <Progress value={metric.value} className={metric.color} />
        </div>
      ))}
      
      <div className="pt-2 border-t mt-4">
        <div className="flex justify-between">
          <span className="text-sm">Temps moyen de traitement</span>
          <span className="text-sm font-medium">{data.avgLoanProcessingTime} jours</span>
        </div>
      </div>
    </div>
  );
};
