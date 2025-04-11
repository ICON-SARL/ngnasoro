
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Building, ChevronUp, CreditCard, DollarSign, Users } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { stats, subsidiesData, recentApprovals, isLoading } = useAdminDashboardData();

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Tableau de Bord MEREF</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    SFDs Enregistrées
                  </CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSfds}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeSfds} actives
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Subventions Totales
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSubsidies || "0"}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingSubsidies || "0"} en attente d'approbation
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clients Enregistrés
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClients || stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Via toutes les SFDs
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>État des Subventions</CardTitle>
                  <CardDescription>
                    Aperçu des subventions approuvées et en attente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Approuvées</span>
                          <span className="text-sm font-medium text-right">
                            {subsidiesData.approved} / {subsidiesData.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${(subsidiesData.approved / subsidiesData.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-right mt-1">
                          {(subsidiesData.approvedAmount / 1000000).toFixed(1)}M FCFA
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">En attente</span>
                          <span className="text-sm font-medium text-right">
                            {subsidiesData.pending} / {subsidiesData.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-amber-500 h-2.5 rounded-full" 
                            style={{ width: `${(subsidiesData.pending / subsidiesData.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-right mt-1">
                          {(subsidiesData.pendingAmount / 1000000).toFixed(1)}M FCFA
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Approbations Récentes</CardTitle>
                  <CardDescription>
                    Dernières subventions approuvées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentApprovals
                      .filter(approval => approval.status === 'approved')
                      .slice(0, 4)
                      .map(approval => (
                        <div key={approval.id} className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-medium">{approval.sfd_name}</span>
                            <span className="text-xs text-muted-foreground">{approval.region}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              {(approval.amount / 1000000).toFixed(1)}M FCFA
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(approval.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques détaillées</CardTitle>
              <CardDescription>
                Accédez à des rapports et analyses avancés
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <button className="bg-[#0D6A51] text-white px-4 py-3 rounded-lg flex items-center justify-center hover:bg-[#0D6A51]/90 transition-colors">
                <BarChart className="mr-2 h-5 w-5" />
                <span>Voir les Rapports Détaillés</span>
              </button>
              
              <button className="bg-white border border-gray-200 px-4 py-3 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <CreditCard className="mr-2 h-5 w-5" />
                <span>Gestion des Subventions</span>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
