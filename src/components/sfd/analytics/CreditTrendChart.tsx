
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CreditTrendChartProps {
  data?: any[];
  title?: string;
  height?: number;
}

export const CreditTrendChart: React.FC<CreditTrendChartProps> = ({ 
  data = [], 
  title = "Tendances des Crédits", 
  height = 300 
}) => {
  // Données de tendance par défaut si aucune n'est fournie
  const defaultData = [
    { month: 'Jan', approved: 4, rejected: 1, pending: 2 },
    { month: 'Fév', approved: 3, rejected: 2, pending: 3 },
    { month: 'Mar', approved: 5, rejected: 0, pending: 1 },
    { month: 'Avr', approved: 7, rejected: 2, pending: 4 },
    { month: 'Mai', approved: 6, rejected: 1, pending: 2 },
    { month: 'Jun', approved: 9, rejected: 3, pending: 1 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="approved" stroke="#10B981" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="rejected" stroke="#EF4444" />
            <Line type="monotone" dataKey="pending" stroke="#F59E0B" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
