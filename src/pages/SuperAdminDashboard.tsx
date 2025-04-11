
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { useSubsidiesByRegion } from '@/hooks/useSubsidiesByRegion';
import { PendingSubsidies } from '@/components/admin/dashboard/PendingSubsidies';

// Define types
interface DashboardStats {
  totalSfds: number;
  activeSfds: number;
  pendingSubsidies: number;
  totalClients: number;
}

interface SubsidiesData {
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
}

interface RecentApproval {
  id: string;
  sfdName: string;
  amount: number;
  date: string;
  region: string;
}

const SuperAdminDashboard = () => {
  const { stats, subsidiesData, recentApprovals, isLoading } = useAdminDashboardData();
  const { subsidiesByRegion } = useSubsidiesByRegion();

  const mockPendingRequests = [
    {
      id: '1',
      sfdName: 'Kafo Jiginew',
      amount: 5000000,
      date: '2024-04-05',
      status: 'pending' as const,
      region: 'Bamako'
    },
    {
      id: '2',
      sfdName: 'Nyèsigiso',
      amount: 3500000,
      date: '2024-04-03',
      status: 'pending' as const,
      region: 'Sikasso'
    },
    {
      id: '3',
      sfdName: 'Soro Yiriwaso',
      amount: 2800000,
      date: '2024-04-02',
      status: 'pending' as const,
      region: 'Ségou'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord Super Admin</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                SFDs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                ) : (
                  stats.totalSfds
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                ) : (
                  `${stats.activeSfds} actifs`
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Subventions totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                ) : (
                  `${(subsidiesData.totalAmount / 1000000).toFixed(1)}M FCFA`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                ) : (
                  `${stats.pendingSubsidies} demandes en attente`
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                ) : (
                  stats.totalClients.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                ) : (
                  "Utilisateurs enregistrés"
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Subventions approuvées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                ) : (
                  `${(subsidiesData.approvedAmount / 1000000).toFixed(1)}M FCFA`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                ) : (
                  `${(subsidiesData.pendingAmount / 1000000).toFixed(1)}M FCFA en attente`
                )}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="subsidies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subsidies">Subventions</TabsTrigger>
            <TabsTrigger value="sfds">SFDs</TabsTrigger>
            <TabsTrigger value="regions">Régions</TabsTrigger>
          </TabsList>
          <TabsContent value="subsidies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PendingSubsidies 
                pendingRequests={mockPendingRequests}
                isLoading={isLoading}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Subventions récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : recentApprovals.length === 0 ? (
                    <p className="text-muted-foreground">Aucune subvention récemment approuvée.</p>
                  ) : (
                    <ul className="space-y-4">
                      {recentApprovals.map((approval) => (
                        <li key={approval.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{approval.sfdName}</p>
                            <p className="text-sm text-muted-foreground">{approval.region}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{approval.amount.toLocaleString()} FCFA</p>
                            <p className="text-sm text-muted-foreground">{approval.date}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="sfds">
            <Card>
              <CardHeader>
                <CardTitle>Performance des SFDs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Données sur la performance des SFDs à venir.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="regions">
            <Card>
              <CardHeader>
                <CardTitle>Distribution par région</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subsidiesByRegion.map((item) => (
                    <div key={item.region} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.region}</p>
                        <p className="text-sm text-muted-foreground">{item.sfds} SFDs</p>
                      </div>
                      <p className="font-medium">{item.amount.toLocaleString()} FCFA</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
