
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DistributionChart } from './DistributionChart';

// Sample data for the charts
const transactionData = [
  { name: 'Jan', montant: 4000 },
  { name: 'Fév', montant: 3000 },
  { name: 'Mar', montant: 5000 },
  { name: 'Avr', montant: 2780 },
  { name: 'Mai', montant: 1890 },
  { name: 'Juin', montant: 2390 },
];

const distributionData = [
  { name: 'Prêts', value: 400 },
  { name: 'Épargnes', value: 300 },
  { name: 'Subventions', value: 200 },
  { name: 'Autres', value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const ChartsDisplay: React.FC = () => {
  const isLoading = false; // Usually this would come from a query or state

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions par Mois</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={transactionData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
              <Legend />
              <Bar dataKey="montant" fill="#0D6A51" name="Montant (FCFA)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Distribution des Ressources</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value).toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Distribution des Opérations Financières</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <DistributionChart isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};
