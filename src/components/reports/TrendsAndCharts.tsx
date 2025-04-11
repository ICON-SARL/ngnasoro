
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Share, FileText, TrendingUp, BarChart } from 'lucide-react';
import { 
  LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

// Données d'exemple
const monthlyTransactions = [
  { month: 'Janvier', montant: 1250000 },
  { month: 'Février', montant: 1500000 },
  { month: 'Mars', montant: 1800000 },
  { month: 'Avril', montant: 2200000 },
  { month: 'Mai', montant: 2000000 },
  { month: 'Juin', montant: 2400000 },
  { month: 'Juillet', montant: 2600000 },
  { month: 'Août', montant: 2300000 },
  { month: 'Septembre', montant: 2800000 },
  { month: 'Octobre', montant: 3000000 },
  { month: 'Novembre', montant: 3200000 },
  { month: 'Décembre', montant: 3500000 },
];

const loanCategories = [
  { category: 'Agriculture', value: 35 },
  { category: 'Commerce', value: 25 },
  { category: 'Éducation', value: 15 },
  { category: 'Logement', value: 20 },
  { category: 'Autres', value: 5 },
];

const repaymentPerformance = [
  { month: 'Jan', onTime: 85, late: 12, defaulted: 3 },
  { month: 'Fév', onTime: 82, late: 15, defaulted: 3 },
  { month: 'Mar', onTime: 88, late: 10, defaulted: 2 },
  { month: 'Avr', onTime: 91, late: 8, defaulted: 1 },
  { month: 'Mai', onTime: 87, late: 10, defaulted: 3 },
  { month: 'Juin', onTime: 89, late: 9, defaulted: 2 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function TrendsAndCharts() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('year');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tendances & Graphiques</CardTitle>
              <CardDescription>
                Analysez les tendances financières et visualisez les performances
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="loans">Prêts</TabsTrigger>
              <TabsTrigger value="repayments">Remboursements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Volume des transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyTransactions}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`} />
                          <Legend />
                          <Line type="monotone" dataKey="montant" stroke="#0D6A51" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Répartition des prêts par catégorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={loanCategories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {loanCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Volume des transactions mensuelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyTransactions}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="montant" 
                          stroke="#0D6A51" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="loans">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Distribution des prêts par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={loanCategories}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar dataKey="value" fill="#0D6A51" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="repayments">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Performance des remboursements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={repaymentPerformance}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                        stackOffset="expand"
                        barSize={60}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(tick) => `${tick}%`} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar dataKey="onTime" stackId="a" fill="#4ADE80" name="À temps" />
                        <Bar dataKey="late" stackId="a" fill="#FACC15" name="En retard" />
                        <Bar dataKey="defaulted" stackId="a" fill="#F87171" name="Défaut" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
