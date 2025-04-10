
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building, Search, UserPlus, Users, Plus, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { AddSfdAdminDialog } from '@/components/admin/sfd/AddSfdAdminDialog';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';
import { SfdAdminManager } from '@/components/admin/sfd/SfdAdminManager';
import { SfdAddDialog } from '@/components/admin/sfd/SfdAddDialog';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';

export function SfdManagementContainer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sfds, setSfds] = useState<any[]>([]);
  const [selectedSfd, setSelectedSfd] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showAddSfdDialog, setShowAddSfdDialog] = useState(false);
  const { toast } = useToast();
  const { isLoading: isLoadingAdmin, error, addSfdAdmin } = useSfdAdminManagement();
  const queryClient = useQueryClient();

  // Fonction pour rafraîchir les données
  const fetchSfds = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setSfds(data || []);
      if (data && data.length > 0 && !selectedSfd) {
        setSelectedSfd(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les SFDs: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedSfd, toast]);

  // Chargement initial des données
  useEffect(() => {
    fetchSfds();
  }, [fetchSfds]);

  // Ecouteur d'événements pour détecter l'ajout d'une nouvelle SFD
  useEffect(() => {
    // Configurez un écouteur pour le changement des données du QueryClient
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      console.log("Query cache changed, refreshing SFDs...");
      fetchSfds();
    });
    
    return () => {
      unsubscribe();
    };
  }, [queryClient, fetchSfds]);

  const filteredSfds = sfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sfd.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sfd.region && sfd.region.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddAdmin = (data: any) => {
    addSfdAdmin({
      ...data,
      role: 'sfd_admin'
    });
    setShowAddAdminDialog(false);
  };

  const handleRefreshData = () => {
    fetchSfds();
    queryClient.invalidateQueries({ queryKey: ['sfds'] });
    toast({
      title: "Rafraîchissement",
      description: "Liste des SFDs mise à jour",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  // Surveiller les changements de dialogue pour rafraîchir les données
  const handleAddDialogChange = (open: boolean) => {
    setShowAddSfdDialog(open);
    if (!open) {
      // Si le dialogue se ferme, rafraîchir les données
      setTimeout(() => {
        fetchSfds();
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gestion des SFDs</h1>
          <p className="text-sm text-muted-foreground">
            Administration centrale des institutions de microfinance partenaires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshData}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowAddSfdDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Nouvelle SFD
          </Button>
          <Button 
            onClick={() => setShowAddAdminDialog(true)}
            className="gap-2"
            disabled={!selectedSfd}
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un Admin SFD
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>SFDs Partenaires</CardTitle>
              <CardDescription>
                {sfds.length} institutions enregistrées
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher par nom ou région..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="h-[500px] overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSfds.map((sfd) => (
                    <div 
                      key={sfd.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted ${selectedSfd?.id === sfd.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedSfd(sfd)}
                    >
                      <div className="flex-shrink-0 h-10 w-10 mr-3 bg-primary/10 rounded-full flex items-center justify-center">
                        {sfd.logo_url ? (
                          <img src={sfd.logo_url} alt={sfd.name} className="h-8 w-8 rounded-full" />
                        ) : (
                          <Building className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{sfd.name}</p>
                          <div className="ml-2">{getStatusBadge(sfd.status)}</div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          Code: {sfd.code} {sfd.region ? `• ${sfd.region}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredSfds.length === 0 && (
                    <div className="text-center p-4 text-muted-foreground">
                      Aucune SFD trouvée
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedSfd ? (
            <>
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {selectedSfd.logo_url && (
                        <img src={selectedSfd.logo_url} alt={selectedSfd.name} className="h-6 w-6 rounded-full" />
                      )}
                      {selectedSfd.name}
                    </CardTitle>
                    <CardDescription>
                      Code: {selectedSfd.code} • Région: {selectedSfd.region || 'Non spécifiée'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="list">Informations</TabsTrigger>
                      <TabsTrigger value="admins">
                        <Users className="h-4 w-4 mr-1" />
                        Administrateurs
                      </TabsTrigger>
                      <TabsTrigger value="subsidies">Subventions</TabsTrigger>
                      <TabsTrigger value="clients">Clients</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="list">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
                            <p>{selectedSfd.status === 'active' ? 'Actif' : selectedSfd.status === 'pending' ? 'En attente' : 'Inactif'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Date de création</h3>
                            <p>{new Date(selectedSfd.created_at).toLocaleDateString()}</p>
                          </div>
                          {selectedSfd.contact_email && (
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Email de contact</h3>
                              <p>{selectedSfd.contact_email}</p>
                            </div>
                          )}
                          {selectedSfd.phone && (
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Téléphone</h3>
                              <p>{selectedSfd.phone}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Dernière mise à jour</h3>
                            <p>{new Date(selectedSfd.updated_at).toLocaleDateString()}</p>
                          </div>
                          {selectedSfd.description && (
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                              <p>{selectedSfd.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="admins">
                      <SfdAdminManager sfdId={selectedSfd.id} sfdName={selectedSfd.name} />
                    </TabsContent>
                    
                    <TabsContent value="subsidies">
                      <div className="text-center p-4 text-muted-foreground">
                        Informations sur les subventions à venir
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="clients">
                      <div className="text-center p-4 text-muted-foreground">
                        Informations sur les clients à venir
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Sélectionnez une SFD pour afficher ses détails
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedSfd && (
        <AddSfdAdminDialog
          open={showAddAdminDialog}
          onOpenChange={setShowAddAdminDialog}
          sfdId={selectedSfd.id}
          sfdName={selectedSfd.name}
          onAddAdmin={handleAddAdmin}
          isLoading={isLoadingAdmin}
          error={error}
        />
      )}

      <SfdAddDialog
        open={showAddDialog}
        onOpenChange={handleAddDialogChange}
      />
    </div>
  );
}
