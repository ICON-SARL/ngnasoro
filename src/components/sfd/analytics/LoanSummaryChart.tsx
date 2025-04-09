
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface LoanSummaryChartProps {
  sfdId?: string;
  staffRole?: string;
}

export function LoanSummaryChart({ sfdId, staffRole }: LoanSummaryChartProps) {
  const { canViewTransactions } = useRolePermissions();
  const hasAccess = canViewTransactions(staffRole);
  
  // Sample data for the loan summary chart
  const data = [
    { name: 'Actifs', value: 45, color: '#10B981' },
    { name: 'En attente', value: 12, color: '#F59E0B' },
    { name: 'En retard', value: 8, color: '#EF4444' },
    { name: 'Remboursés', value: 22, color: '#3B82F6' },
  ];
  
  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Résumé des crédits</CardTitle>
          <CardDescription>Accès non autorisé</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour voir ce graphique.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé des crédits par statut</CardTitle>
        <CardDescription>Répartition actuelle des prêts</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
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
            <Tooltip formatter={(value) => [`${value} prêts`, 'Nombre']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
