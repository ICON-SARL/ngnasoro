
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CreditTrendChartProps {
  data?: any[];
  loading?: boolean;
}

export const CreditTrendChart: React.FC<CreditTrendChartProps> = ({ 
  data = [], 
  loading = false 
}) => {
  // Use sample data if no data is provided or loading
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', approved: 10, pending: 5, rejected: 2 },
    { month: 'Fév', approved: 15, pending: 8, rejected: 1 },
    { month: 'Mar', approved: 12, pending: 9, rejected: 3 },
    { month: 'Avr', approved: 18, pending: 5, rejected: 2 },
    { month: 'Mai', approved: 22, pending: 7, rejected: 1 }
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Tendance des Crédits</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke="#4ade80" 
                strokeWidth={2}
                name="Approuvés"
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                stroke="#facc15" 
                strokeWidth={2}
                name="En attente"
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke="#f87171" 
                strokeWidth={2}
                name="Rejetés"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
