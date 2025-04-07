
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const data = [
  {
    name: 'Jan',
    approuvés: 5,
    rejetés: 2,
    en_attente: 3,
  },
  {
    name: 'Fév',
    approuvés: 8,
    rejetés: 1,
    en_attente: 2,
  },
  {
    name: 'Mar',
    approuvés: 12,
    rejetés: 3,
    en_attente: 4,
  },
  {
    name: 'Avr',
    approuvés: 10,
    rejetés: 2,
    en_attente: 5,
  },
  {
    name: 'Mai',
    approuvés: 15,
    rejetés: 2,
    en_attente: 1,
  },
  {
    name: 'Juin',
    approuvés: 18,
    rejetés: 3,
    en_attente: 2,
  },
];

export const CreditTrendChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendances des Crédits</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="approuvés" fill="#4ade80" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rejetés" fill="#f87171" radius={[4, 4, 0, 0]} />
            <Bar dataKey="en_attente" fill="#facc15" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
