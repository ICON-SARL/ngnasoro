
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSfdsList } from '@/hooks/useSfdData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdDashboardStats } from '@/components/sfd/dashboard';
import { CreditTrendChart } from '@/components/sfd/analytics';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { PendingSubsidies } from '@/components/sfd/dashboard';
import { Badge } from '@/components/ui/badge';
import { Search, Building, Calendar, User, CreditCard, Loader2 } from 'lucide-react';
import { useSfdStatistics } from '@/hooks/useSfdStatistics';
import { Skeleton } from '@/components/ui/skeleton';

export const SfdInspector = () => {
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(null);
  const { data: sfdsList, isLoading: isLoadingSfds } = useSfdsList();
  const { data: sfdStats, isLoading: isLoadingStats } = useSfdStatistics(selectedSfdId || undefined);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge>Inconnu</Badge>;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const selectedSfd = sfdsList?.find(sfd => sfd.id === selectedSfdId);
  
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Inspection des SFDs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-md mb-6">
          <Select
            disabled={isLoadingSfds}
            onValueChange={(value) => setSelectedSfdId(value)}
            value={selectedSfdId || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une SFD à inspecter" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingSfds ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Chargement des SFDs...
                </div>
              ) : (
                sfdsList?.map((sfd) => (
                  <SelectItem key={sfd.id} value={sfd.id}>
                    {sfd.name} ({sfd.code})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        {selectedSfd ? (
          <Tabs defaultValue="info">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {selectedSfd.logo_url ? (
                        <img 
                          src={selectedSfd.logo_url} 
                          alt={`Logo ${selectedSfd.name}`} 
                          className="h-16 w-16 mr-4 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 mr-4 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{selectedSfd.name}</h3>
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground mr-2">Code: {selectedSfd.code}</span>
                          {getStatusBadge(selectedSfd.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center border-b pb-2">
                        <span className="w-1/3 text-muted-foreground">Région</span>
                        <span className="font-medium">{selectedSfd.region || 'Non spécifiée'}</span>
                      </div>
                      <div className="flex items-center border-b pb-2">
                        <span className="w-1/3 text-muted-foreground">Email</span>
                        <span className="font-medium">{selectedSfd.contact_email || 'Non spécifié'}</span>
                      </div>
                      <div className="flex items-center border-b pb-2">
                        <span className="w-1/3 text-muted-foreground">Téléphone</span>
                        <span className="font-medium">{selectedSfd.phone || 'Non spécifié'}</span>
                      </div>
                      <div className="flex items-center border-b pb-2">
                        <span className="w-1/3 text-muted-foreground">Date création</span>
                        <span className="font-medium">{formatDate(selectedSfd.created_at)}</span>
                      </div>
                    </div>
                    
                    {selectedSfd.description && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm">{selectedSfd.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Statistiques de la SFD</h3>
                    
                    {isLoadingStats ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-50 rounded-full mr-4">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold">{sfdStats?.clientsTotal || 0}</div>
                            <div className="text-sm text-muted-foreground">Clients</div>
                          </div>
                          <div className="ml-auto text-green-600 text-sm">
                            +{sfdStats?.clientsNewThisMonth || 0} ce mois
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-50 rounded-full mr-4">
                            <CreditCard className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold">{sfdStats?.activeLoans || 0}</div>
                            <div className="text-sm text-muted-foreground">Prêts actifs</div>
                          </div>
                          <div className="ml-auto text-sm">
                            {sfdStats?.pendingApprovalLoans || 0} en attente
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="p-2 bg-amber-50 rounded-full mr-4">
                            <Search className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold">{sfdStats?.subsidyRequests || 0}</div>
                            <div className="text-sm text-muted-foreground">Demandes de subvention</div>
                          </div>
                          <div className="ml-auto text-sm">
                            {sfdStats?.pendingSubsidyRequests || 0} en attente
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 pt-4 border-t">
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={() => window.open(`/admin/sfd/${selectedSfdId}`, '_blank')}
                      >
                        Voir détails complets
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="dashboard">
              <div className="space-y-6">
                <SfdDashboardStats />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CreditTrendChart />
                  <PendingSubsidies />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  Les statistiques complètes pour cette SFD seront disponibles prochainement.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => window.open(`/admin/reports?sfd=${selectedSfdId}`, '_blank')}
              >
                Générer un rapport
              </Button>
              <Button 
                variant="default"
                onClick={() => window.open(`/admin/sfd/${selectedSfdId}/admin`, '_blank')}
              >
                Gérer les administrateurs
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-lg">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Sélectionnez une SFD</h3>
            <p className="text-muted-foreground">
              Choisissez une SFD dans la liste déroulante pour voir ses informations détaillées
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SfdInspector;
