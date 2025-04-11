
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DistributionChart } from './DistributionChart';

// Sample data for demonstration
const monthlyData = [
  { name: 'Jan', value: 4000 },
  { name: 'Fév', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Avr', value: 4500 },
  { name: 'Mai', value: 6000 },
  { name: 'Juin', value: 5500 },
];

const quarterlyData = [
  { name: 'Q1', value: 12000 },
  { name: 'Q2', value: 16000 },
  { name: 'Q3', value: 14000 },
  { name: 'Q4', value: 18000 },
];

const categoryData = [
  { name: 'Prêts', value: 35 },
  { name: 'Épargnes', value: 40 },
  { name: 'Subventions', value: 15 },
  { name: 'Autres', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function TrendsAndCharts() {
  const [chartType, setChartType] = useState('line');
  const [timeframe, setTimeframe] = useState('month');
  const [activeTab, setActiveTab] = useState('financial');
  
  const data = timeframe === 'month' ? monthlyData : quarterlyData;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tendances et Graphiques</CardTitle>
          <CardDescription>
            Visualisez les tendances et analysez les données avec des graphiques interactifs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="financial">Financier</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="operations">Opérations</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de graphique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Courbe</SelectItem>
                  <SelectItem value="bar">Histogramme</SelectItem>
                  <SelectItem value="pie">Camembert</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensuel</SelectItem>
                  <SelectItem value="quarter">Trimestriel</SelectItem>
                  <SelectItem value="year">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <TabsContent value="financial" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Tendances Financières
                    {timeframe === 'month' ? ' (Mensuelles)' : timeframe === 'quarter' ? ' (Trimestrielles)' : ' (Annuelles)'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {chartType === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#0D6A51" activeDot={{ r: 8 }} name="Montant (FCFA)" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  
                  {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                        <Legend />
                        <Bar dataKey="value" fill="#0D6A51" name="Montant (FCFA)" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  
                  {chartType === 'pie' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={140}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value).toFixed(0)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clients" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques Clients</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Nouveaux', value: 120 },
                        { name: 'Actifs', value: 450 },
                        { name: 'Inactifs', value: 80 },
                        { name: 'Premium', value: 50 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Nombre de clients" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="operations" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Distribution des Opérations</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <DistributionChart />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
