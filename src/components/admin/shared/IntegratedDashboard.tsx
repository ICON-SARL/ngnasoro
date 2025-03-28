
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Building, 
  Users, 
  CircleDollarSign,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { merefSfdIntegration } from '@/utils/merefSfdIntegration';
import { supabase } from '@/integrations/supabase/client';

// Couleurs pour les graphiques
const COLORS = ['#0D6A51', '#2E8A70', '#4EAA8F', '#6EC9AE', '#8FE9CD'];
const LOAN_STATUS_COLORS = {
  pending: '#FDB022',
  approved: '#039855',
  rejected: '#F04438',
  active: '#0D6A51',
  completed: '#6E56CF'
};

export function IntegratedDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [sfdList, setSfdList] = useState<any[]>([]);
  const [subsidyData, setSubsidyData] = useState<any[]>([]);
  const [loanDistribution, setLoanDistribution] = useState<any[]>([]);
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(null);
  
  // Récupérer les données générales et les SFDs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer la liste des SFDs
        const { data: sfds, error: sfdsError } = await supabase
          .from('sfds')
          .select('id, name, region, status')
          .eq('status', 'active');
          
        if (sfdsError) throw sfdsError;
        
        setSfdList(sfds || []);
        
        // Si nous sommes un admin, récupérer les données de toutes les SFDs
        if (isAdmin && sfds && sfds.length > 0) {
          setSelectedSfdId(sfds[0].id);
          
          // Récupérer les statistiques pour toutes les SFDs
          const stats = {
            totalClients: 0,
            totalLoans: 0,
            activeLoans: 0,
            totalLoanAmount: 0,
            totalSubsidyAmount: 0,
            usedSubsidyAmount: 0
          };
          
          const statsPromises = sfds.map(sfd => merefSfdIntegration.getSfdStatistics(sfd.id));
          const statsResults = await Promise.all(statsPromises);
          
          statsResults.forEach(result => {
            if (result.success && result.data) {
              stats.totalClients += result.data.clientsCount || 0;
              stats.activeLoans += result.data.activeLoansCount || 0;
              stats.totalLoanAmount += result.data.totalLoanAmount || 0;
              stats.totalSubsidyAmount += result.data.totalSubsidyAmount || 0;
              stats.usedSubsidyAmount += result.data.usedSubsidyAmount || 0;
            }
          });
          
          // Récupérer le nombre total de prêts
          const { count: loansCount, error: loansError } = await supabase
            .from('sfd_loans')
            .select('*', { count: 'exact', head: true });
            
          if (!loansError) {
            stats.totalLoans = loansCount || 0;
          }
          
          setOverviewData(stats);
          
          // Récupérer les données des subventions
          const { data: subsidies, error: subsidiesError } = await supabase
            .from('sfd_subsidies')
            .select('*, sfds(name)')
            .order('allocated_at', { ascending: false })
            .limit(5);
            
          if (!subsidiesError && subsidies) {
            setSubsidyData(subsidies.map(subsidy => ({
              ...subsidy,
              sfd_name: subsidy.sfds?.name || 'SFD Inconnue',
              utilization_rate: subsidy.amount > 0 
                ? Math.round((subsidy.used_amount / subsidy.amount) * 100) 
                : 0
            })));
          }
          
          // Récupérer la distribution des prêts par statut
          const { data: loansByStatus, error: loanStatusError } = await supabase
            .from('sfd_loans')
            .select('status, count')
            .select(`
              status,
              count() over (partition by status)
            `)
            .limit(1, { foreignTable: 'status' });
            
          if (!loanStatusError && loansByStatus) {
            // Traiter les données pour éliminer les doublons
            const statusMap = new Map();
            loansByStatus.forEach(item => {
              statusMap.set(item.status, parseInt(item.count));
            });
            
            const distribution = Array.from(statusMap).map(([status, count]) => ({
              status,
              count,
              color: LOAN_STATUS_COLORS[status as keyof typeof LOAN_STATUS_COLORS] || '#999'
            }));
            
            setLoanDistribution(distribution);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAdmin]);
  
  // Récupérer les données d'une SFD spécifique
  useEffect(() => {
    if (selectedSfdId) {
      const fetchSfdData = async () => {
        try {
          const result = await merefSfdIntegration.getSfdStatistics(selectedSfdId);
          if (result.success && result.data) {
            setOverviewData({
              totalClients: result.data.clientsCount,
              activeLoans: result.data.activeLoansCount,
              totalLoanAmount: result.data.totalLoanAmount,
              totalSubsidyAmount: result.data.totalSubsidyAmount,
              usedSubsidyAmount: result.data.usedSubsidyAmount,
              subsidyUtilizationRate: result.data.subsidyUtilizationRate
            });
          }
        } catch (error) {
          console.error('Error fetching SFD data:', error);
        }
      };
      
      fetchSfdData();
    }
  }, [selectedSfdId]);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord intégré MEREF-SFD</h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble des opérations et données partagées
          </p>
        </div>
        
        {isAdmin && sfdList.length > 0 && (
          <div className="flex mt-4 md:mt-0">
            <select
              className="px-3 py-2 rounded border text-sm"
              value={selectedSfdId || ''}
              onChange={(e) => setSelectedSfdId(e.target.value)}
            >
              <option value="">Toutes les SFD</option>
              {sfdList.map((sfd) => (
                <option key={sfd.id} value={sfd.id}>
                  {sfd.name} - {sfd.region}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="subsidies">Subventions</TabsTrigger>
          <TabsTrigger value="loans">Prêts</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clients Enregistrés
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {overviewData?.totalClients || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Prêts Actifs
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[100px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {overviewData?.activeLoans || 0}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Montant Total des Prêts
                </CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[150px]" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatAmount(overviewData?.totalLoanAmount || 0)}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Utilisation des Subventions
                </CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-[80px]" />
                ) : (
                  <div className="flex flex-col">
                    <div className="text-2xl font-bold">
                      {overviewData?.subsidyUtilizationRate || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatAmount(overviewData?.usedSubsidyAmount || 0)} / {formatAmount(overviewData?.totalSubsidyAmount || 0)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Distribution des Prêts par Statut</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : loanDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={loanDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {loanDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} prêts`, 'Nombre']}
                        labelFormatter={(label) => `Statut: ${label}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Vue d'ensemble des Subventions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : subsidyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={subsidyData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 40,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="sfd_name" 
                        angle={-45} 
                        textAnchor="end"
                        tick={{ fontSize: 12 }}
                        height={70}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [formatAmount(value), 'Montant']}
                        labelFormatter={(label) => `SFD: ${label}`}
                      />
                      <Legend />
                      <Bar name="Montant total" dataKey="amount" fill="#0D6A51" />
                      <Bar name="Montant utilisé" dataKey="used_amount" fill="#FDB022" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Aucune donnée de subvention disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="subsidies">
          <Card>
            <CardHeader>
              <CardTitle>Subventions</CardTitle>
              <CardDescription>
                Détail des subventions allouées et leur utilisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : subsidyData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b">
                        <th className="text-left py-2 px-2">SFD</th>
                        <th className="text-left py-2 px-2">Montant Alloué</th>
                        <th className="text-left py-2 px-2">Montant Utilisé</th>
                        <th className="text-left py-2 px-2">Taux d'utilisation</th>
                        <th className="text-left py-2 px-2">Statut</th>
                        <th className="text-left py-2 px-2">Date d'allocation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subsidyData.map((subsidy, index) => (
                        <tr key={index} className="border-b border-muted-foreground/10">
                          <td className="py-2 px-2">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{subsidy.sfd_name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2">{formatAmount(subsidy.amount)}</td>
                          <td className="py-2 px-2">{formatAmount(subsidy.used_amount)}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center">
                              <div className="h-2 w-16 bg-gray-200 rounded-full mr-2">
                                <div
                                  className="h-2 bg-green-500 rounded-full"
                                  style={{ width: `${subsidy.utilization_rate}%` }}
                                />
                              </div>
                              <span>{subsidy.utilization_rate}%</span>
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <Badge 
                              className={
                                subsidy.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : subsidy.status === 'depleted'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {subsidy.status === 'active' 
                                ? 'Active'
                                : subsidy.status === 'depleted'
                                ? 'Épuisée'
                                : 'Révoquée'
                              }
                            </Badge>
                          </td>
                          <td className="py-2 px-2">
                            {new Date(subsidy.allocated_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée de subvention disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Prêts</CardTitle>
              <CardDescription>
                Informations sur les prêts accordés et leur distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
              Contenu détaillé des prêts à implémenter
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
              <CardDescription>
                Statistiques et distribution des clients par SFD
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
              Contenu détaillé des clients à implémenter
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
