
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  FileText,
  Calendar,
  Wallet,
  CreditCard,
  BarChart4,
  PieChart as PieChartIcon,
  TrendingUp,
  AlertCircle,
  CheckCheck,
  ClipboardList
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialReports } from '@/hooks/useFinancialReports';

export function FinancialReports() {
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  
  const { 
    loanData, 
    repaymentData, 
    defaultRateData, 
    loanDistributionData,
    isLoading,
    exportReport
  } = useFinancialReports(timeRange);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Rapports Financiers</h2>
          <p className="text-sm text-muted-foreground">
            Tableaux de bord et rapports financiers pour analyse et décision
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportReport(reportType)}>
            <Download className="h-4 w-4 mr-1" />
            Exporter
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={reportType} onValueChange={setReportType}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <ClipboardList className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="loans">
            <CreditCard className="h-4 w-4 mr-2" />
            Prêts
          </TabsTrigger>
          <TabsTrigger value="repayments">
            <CheckCheck className="h-4 w-4 mr-2" />
            Remboursements
          </TabsTrigger>
          <TabsTrigger value="defaults">
            <AlertCircle className="h-4 w-4 mr-2" />
            Défauts de paiement
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-primary" />
                  Total Prêts Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">65,250,000 FCFA</div>
                <p className="text-xs text-muted-foreground">126 prêts en cours</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  Taux de Remboursement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92.5%</div>
                <p className="text-xs text-muted-foreground">+2.3% vs mois précédent</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                  Taux de Défaut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-xs text-muted-foreground">-0.5% vs mois précédent</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Prêts Décaissés vs Remboursements
                </CardTitle>
                <CardDescription>
                  Évolution sur les 6 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { month: 'Jan', disbursed: 12500000, repaid: 8200000 },
                        { month: 'Fév', disbursed: 15700000, repaid: 9800000 },
                        { month: 'Mar', disbursed: 14200000, repaid: 10500000 },
                        { month: 'Avr', disbursed: 16800000, repaid: 12200000 },
                        { month: 'Mai', disbursed: 18900000, repaid: 13800000 },
                        { month: 'Juin', disbursed: 17200000, repaid: 14500000 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => `${(Number(value)).toLocaleString()} FCFA`} />
                      <Legend />
                      <Bar dataKey="disbursed" name="Prêts Décaissés" fill="#0D6A51" />
                      <Bar dataKey="repaid" name="Remboursements" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Distribution des Prêts par Secteur
                </CardTitle>
                <CardDescription>
                  Répartition du portefeuille actif
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Agriculture', value: 35 },
                          { name: 'Commerce', value: 25 },
                          { name: 'Services', value: 20 },
                          { name: 'Artisanat', value: 15 },
                          { name: 'Autres', value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {loanDistributionData.map((entry, index) => (
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
        
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Prêts</CardTitle>
              <CardDescription>Volume et quantité de prêts décaissés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={loanData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => [
                      name === 'amount' ? `${Number(value).toLocaleString()} FCFA` : value,
                      name === 'amount' ? 'Montant' : 'Nombre'
                    ]} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="amount" name="Montant des prêts" stroke="#0D6A51" />
                    <Line yAxisId="right" type="monotone" dataKey="count" name="Nombre de prêts" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="repayments">
          <Card>
            <CardHeader>
              <CardTitle>Taux de Remboursement</CardTitle>
              <CardDescription>Performance du portefeuille de prêts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={repaymentData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="rate" name="Taux de remboursement" stroke="#00C49F" />
                    <Line type="monotone" dataKey="onTimeRate" name="Remboursement à l'heure" stroke="#0088FE" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="defaults">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des Défauts de Paiement</CardTitle>
              <CardDescription>Suivi des retards et défauts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={defaultRateData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="defaultRate" name="Taux de défaut" stroke="#FF8042" />
                    <Line type="monotone" dataKey="latePaymentRate" name="Retards de paiement" stroke="#FFBB28" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
