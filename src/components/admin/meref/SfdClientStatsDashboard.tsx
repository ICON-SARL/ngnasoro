
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Filter, BarChart2, PieChart, Users, CreditCard, Calendar } from 'lucide-react';
import { useSfdClientStats } from '@/hooks/admin/useSfdClientStats';
import { ClientStatsBarChart, ClientStatsPieChart } from '@/components/admin/charts';

const SfdClientStatsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFrame, setTimeFrame] = useState('last-30-days');
  const [selectedSfd, setSelectedSfd] = useState('all');
  
  const { 
    isLoading, 
    clientStats, 
    loanStats,
    exportStatsAsCsv,
    exportStatsAsPdf
  } = useSfdClientStats({ timeFrame, sfdId: selectedSfd === 'all' ? undefined : selectedSfd });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Statistiques Clients SFD</h2>
          <p className="text-muted-foreground">
            Aperçu des comptes clients et des prêts à travers les SFDs
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">7 derniers jours</SelectItem>
              <SelectItem value="last-30-days">30 derniers jours</SelectItem>
              <SelectItem value="last-90-days">90 derniers jours</SelectItem>
              <SelectItem value="this-year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedSfd} onValueChange={setSelectedSfd}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrer par SFD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les SFDs</SelectItem>
              {clientStats?.sfds?.map(sfd => (
                <SelectItem key={sfd.id} value={sfd.id}>{sfd.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportStatsAsCsv()}
              disabled={isLoading}
            >
              <FileDown className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportStatsAsPdf()}
              disabled={isLoading}
            >
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comptes Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div className="text-2xl font-bold">
                {isLoading ? '-' : clientStats?.totalClients?.toLocaleString()}
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex text-sm justify-between mt-2">
              <span className="text-green-600 font-medium">
                {isLoading ? '-' : clientStats?.activeClients?.toLocaleString()} actifs
              </span>
              <span className="text-red-600 font-medium">
                {isLoading ? '-' : clientStats?.inactiveClients?.toLocaleString()} inactifs
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant Total des Prêts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div className="text-2xl font-bold">
                {isLoading ? '-' : (loanStats?.totalAmount || 0).toLocaleString()} FCFA
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex text-sm justify-between mt-2">
              <span className="text-amber-600 font-medium">
                {isLoading ? '-' : loanStats?.activeLoans?.toLocaleString()} actifs
              </span>
              <span className="text-blue-600 font-medium">
                {isLoading ? '-' : loanStats?.completedLoans?.toLocaleString()} remboursés
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subventions Utilisées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div className="text-2xl font-bold">
                {isLoading ? '-' : (loanStats?.subsidyAmount || 0).toLocaleString()} FCFA
              </div>
              <div className="p-2 bg-[#0D6A51]/10 rounded-full">
                <BarChart2 className="h-4 w-4 text-[#0D6A51]" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">
                Taux d'utilisation : {isLoading ? '-' : loanStats?.subsidyUsageRate || 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="clients">Clients par SFD</TabsTrigger>
          <TabsTrigger value="loans">Prêts par SFD</TabsTrigger>
          <TabsTrigger value="subsidies">Subventions</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Clients SFD</CardTitle>
                <CardDescription>Clients actifs/inactifs par SFD</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <span>Chargement des données...</span>
                  </div>
                ) : (
                  <ClientStatsBarChart data={clientStats?.sfdClientDistribution || []} />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Prêts</CardTitle>
                <CardDescription>Par statut et par SFD</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <span>Chargement des données...</span>
                  </div>
                ) : (
                  <ClientStatsPieChart data={loanStats?.loanStatusDistribution || []} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="clients" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Clients par SFD</CardTitle>
              <CardDescription>
                Détail des comptes clients et statuts par SFD
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <span>Chargement des données...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">SFD</th>
                        <th className="text-right p-2">Clients Total</th>
                        <th className="text-right p-2">Clients Actifs</th>
                        <th className="text-right p-2">Clients Inactifs</th>
                        <th className="text-right p-2">Nouveaux (ce mois)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientStats?.sfdDetailedStats?.map((sfd) => (
                        <tr key={sfd.id} className="border-b hover:bg-gray-50 cursor-pointer">
                          <td className="p-2">{sfd.name}</td>
                          <td className="text-right p-2">{sfd.totalClients.toLocaleString()}</td>
                          <td className="text-right p-2 text-green-600">{sfd.activeClients.toLocaleString()}</td>
                          <td className="text-right p-2 text-red-600">{sfd.inactiveClients.toLocaleString()}</td>
                          <td className="text-right p-2 text-blue-600">{sfd.newClients.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="loans" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Prêts par SFD</CardTitle>
              <CardDescription>
                Détail des prêts et montants par SFD
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <span>Chargement des données...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">SFD</th>
                        <th className="text-right p-2">Prêts Total</th>
                        <th className="text-right p-2">Prêts Actifs</th>
                        <th className="text-right p-2">Montant Total</th>
                        <th className="text-right p-2">Montant Remboursé</th>
                        <th className="text-right p-2">Subvention MEREF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanStats?.sfdLoanStats?.map((sfd) => (
                        <tr key={sfd.id} className="border-b hover:bg-gray-50 cursor-pointer">
                          <td className="p-2">{sfd.name}</td>
                          <td className="text-right p-2">{sfd.totalLoans.toLocaleString()}</td>
                          <td className="text-right p-2 text-amber-600">{sfd.activeLoans.toLocaleString()}</td>
                          <td className="text-right p-2">{sfd.totalAmount.toLocaleString()} FCFA</td>
                          <td className="text-right p-2 text-green-600">{sfd.repaidAmount.toLocaleString()} FCFA</td>
                          <td className="text-right p-2 text-[#0D6A51]">{sfd.subsidyAmount.toLocaleString()} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subsidies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subventions par SFD</CardTitle>
              <CardDescription>
                Utilisation des subventions MEREF par SFD
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <span>Chargement des données...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">SFD</th>
                        <th className="text-right p-2">Subvention Allouée</th>
                        <th className="text-right p-2">Subvention Utilisée</th>
                        <th className="text-right p-2">Pourcentage Utilisé</th>
                        <th className="text-right p-2">Subvention Restante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanStats?.sfdSubsidyStats?.map((sfd) => (
                        <tr key={sfd.id} className="border-b hover:bg-gray-50 cursor-pointer">
                          <td className="p-2">{sfd.name}</td>
                          <td className="text-right p-2">{sfd.allocatedAmount.toLocaleString()} FCFA</td>
                          <td className="text-right p-2">{sfd.usedAmount.toLocaleString()} FCFA</td>
                          <td className="text-right p-2">
                            <div className="flex items-center justify-end">
                              <div className="bg-gray-200 h-2 rounded-full w-24 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${sfd.usagePercent > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                                  style={{ width: `${sfd.usagePercent}%` }}
                                />
                              </div>
                              {sfd.usagePercent}%
                            </div>
                          </td>
                          <td className="text-right p-2 font-medium">
                            {sfd.remainingAmount.toLocaleString()} FCFA
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertes de Quotas</CardTitle>
              <CardDescription>
                SFDs approchant ou dépassant leurs quotas de prêts alloués
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <span>Chargement des données...</span>
                </div>
              ) : loanStats?.quotaAlerts?.length ? (
                <div className="space-y-4">
                  {loanStats.quotaAlerts.map((alert) => (
                    <div key={alert.sfd_id} className="p-4 border rounded-md bg-amber-50 border-amber-200">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{alert.sfd_name}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-600 font-medium">{alert.usagePercent}% utilisé</div>
                          <div className="text-sm">{alert.remainingAmount.toLocaleString()} FCFA restant</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-muted-foreground">Aucune alerte de quota actuellement</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SfdClientStatsDashboard;
