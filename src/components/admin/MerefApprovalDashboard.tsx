
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Building, 
  FileText, 
  BarChart3, 
  Calendar, 
  Search, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { CreditDecisionFlow } from '@/components/CreditDecisionFlow';
import { useCreditApplications } from '@/hooks/useCreditApplications';
import { Input } from '@/components/ui/input';

export const MerefApprovalDashboard = () => {
  const { applications, isLoading } = useCreditApplications();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('overview');

  // Filter applications by search query
  const filteredApplications = applications?.filter(app => 
    app.sfd_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.reference.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Calculate statistics
  const totalRequests = applications?.length || 0;
  const pendingRequests = applications?.filter(app => app.status === 'pending').length || 0;
  const approvedRequests = applications?.filter(app => app.status === 'approved').length || 0;
  const rejectedRequests = applications?.filter(app => app.status === 'rejected').length || 0;
  
  const averageScore = applications?.length 
    ? Math.round(applications.reduce((sum, app) => sum + app.score, 0) / applications.length) 
    : 0;
  
  // Get top SFDs by approval rate
  const sfdStats = React.useMemo(() => {
    const stats: Record<string, { total: number, approved: number, name: string }> = {};
    
    applications?.forEach(app => {
      if (!stats[app.sfd_id]) {
        stats[app.sfd_id] = { total: 0, approved: 0, name: app.sfd_name };
      }
      
      stats[app.sfd_id].total += 1;
      if (app.status === 'approved') {
        stats[app.sfd_id].approved += 1;
      }
    });
    
    return Object.values(stats)
      .map(stat => ({
        ...stat,
        approvalRate: stat.total ? Math.round((stat.approved / stat.total) * 100) : 0
      }))
      .sort((a, b) => b.approvalRate - a.approvalRate)
      .slice(0, 5);
  }, [applications]);

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" /> Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejetée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total des demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Toutes demandes confondues</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingRequests}</div>
            <Progress value={(pendingRequests / totalRequests) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approuvées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests}</div>
            <Progress value={(approvedRequests / totalRequests) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Score moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}</div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div 
                className={`h-2 rounded-full ${
                  averageScore >= 75 ? 'bg-green-500' : 
                  averageScore >= 50 ? 'bg-amber-500' : 
                  'bg-red-500'
                }`} 
                style={{ width: `${averageScore}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="workflow">Workflow de décision</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Dernières demandes de crédit</CardTitle>
              <CardDescription>
                Aperçu des demandes récentes en attente d'évaluation
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Trier
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="h-8 w-8 mx-auto animate-spin rounded-full border-b-2 border-[#0D6A51]"></div>
                  <p className="mt-2 text-muted-foreground">Chargement des demandes...</p>
                </div>
              ) : filteredApplications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>SFD</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.reference}</TableCell>
                        <TableCell>{application.sfd_name}</TableCell>
                        <TableCell>{application.amount.toLocaleString()} FCFA</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                                application.score >= 75 ? 'bg-green-100 text-green-800' : 
                                application.score >= 50 ? 'bg-amber-100 text-amber-800' : 
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {application.score}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{renderStatusBadge(application.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Aucune demande trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance des SFDs</CardTitle>
                <CardDescription>Top 5 des SFDs par taux d'approbation</CardDescription>
              </CardHeader>
              <CardContent>
                {sfdStats.length > 0 ? (
                  <div className="space-y-4">
                    {sfdStats.map((sfd, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{sfd.name}</span>
                          <span>{sfd.approvalRate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full">
                          <div 
                            className="bg-[#0D6A51] h-2 rounded-full" 
                            style={{ width: `${sfd.approvalRate}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {sfd.approved} approuvées sur {sfd.total} demandes
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Pas assez de données</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribution des scores</CardTitle>
                <CardDescription>Répartition des scores des demandes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[
                    { range: '0-20', count: applications?.filter(a => a.score >= 0 && a.score < 20).length || 0, color: 'bg-red-500' },
                    { range: '20-40', count: applications?.filter(a => a.score >= 20 && a.score < 40).length || 0, color: 'bg-red-400' },
                    { range: '40-60', count: applications?.filter(a => a.score >= 40 && a.score < 60).length || 0, color: 'bg-amber-400' },
                    { range: '60-80', count: applications?.filter(a => a.score >= 60 && a.score < 80).length || 0, color: 'bg-green-400' },
                    { range: '80-100', count: applications?.filter(a => a.score >= 80 && a.score <= 100).length || 0, color: 'bg-green-500' },
                  ].map((bar, index) => {
                    const maxCount = Math.max(...[0, 1, 2, 3, 4].map(i => 
                      applications?.filter(a => 
                        a.score >= i*20 && a.score < (i+1)*20
                      ).length || 0
                    ));
                    const height = maxCount ? (bar.count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className={`${bar.color} w-full rounded-t-sm`} 
                          style={{ height: `${height}%`, minHeight: bar.count ? '10%' : '0' }}
                        ></div>
                        <div className="text-xs mt-2">{bar.range}</div>
                        <div className="text-xs font-medium">{bar.count}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="workflow">
          <CreditDecisionFlow />
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques détaillées</CardTitle>
              <CardDescription>
                Insights approfondis sur les performances du système de crédit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Analytiques avancées</h3>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  Cette fonctionnalité sera disponible dans une prochaine mise à jour. Elle inclura des analyses prédictives, des tendances temporelles et des rapports détaillés.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
