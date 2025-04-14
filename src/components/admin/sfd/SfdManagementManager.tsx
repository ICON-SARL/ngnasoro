
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building, User, MapPin, Mail, Phone, MoreHorizontal, RefreshCw, Edit, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SfdAddDialog } from '@/components/admin/sfd/SfdAddDialog';
import { SfdEditDialog } from '@/components/admin/sfd/SfdEditDialog';
import { Sfd } from '../types/sfd-types';
import { useUpdateSfdMutation } from '../hooks/sfd-management/mutations/useUpdateSfdMutation';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';
import { useSfdData } from '../hooks/sfd-management/useSfdData';

export function SfdManagementManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  
  const updateSfdMutation = useUpdateSfdMutation();
  
  const { sfds = [], isLoading, isError, refetch, error, isRefetching } = useSfdData();
  
  // Log useful debug information
  useEffect(() => {
    console.log('SFD Management Manager State:', { 
      sfdCount: sfds?.length, 
      isLoading, 
      isError, 
      isRefetching, 
      error: error instanceof Error ? error.message : error,
    });
  }, [sfds, isLoading, isError, error, isRefetching]);
  
  // Manual retry mechanism
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
    toast({
      title: "Nouvelle tentative",
      description: "Récupération des données en cours...",
    });
  };
  
  // Filter SFDs based on search term
  const filteredSfds = sfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sfd.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (sfd.region && sfd.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleEdit = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setEditDialogOpen(true);
  };
  
  const handleUpdateSfd = (formData: any) => {
    if (selectedSfd) {
      updateSfdMutation.mutate({ 
        id: selectedSfd.id, 
        data: formData 
      });
      setEditDialogOpen(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Rechercher par nom, code, région..." 
            className="pl-9 w-full" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-auto"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
          >
            {isRefetching ? (
              <Loader size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualiser
          </Button>
          <Button 
            className="flex-1 sm:flex-auto"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau SFD
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Institutions de Microfinance Partenaires</CardTitle>
          <CardDescription>Gérez les SFDs qui utilisent la plateforme N'GNA SÔRÔ!</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !isError ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader size="lg" className="mb-4" />
              <p className="text-muted-foreground">Chargement des SFDs en cours...</p>
            </div>
          ) : isError ? (
            <div className="text-center p-8 bg-red-50 rounded-md">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Erreur lors du chargement des SFDs
              </h3>
              <p className="text-red-700 mb-4">
                {error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer."}
              </p>
              <Button 
                variant="outline" 
                className="mb-2"
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer ({retryCount})
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Si le problème persiste, veuillez contacter le support technique.
              </p>
            </div>
          ) : filteredSfds.length === 0 ? (
            <div className="text-center p-8 bg-muted/20 rounded-md">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Aucun SFD trouvé</p>
              {sfds.length > 0 && searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Essayez de modifier votre recherche
                </p>
              )}
              {sfds.length === 0 && !searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter votre première SFD
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSfds.map(sfd => (
                <Card key={sfd.id} className="overflow-hidden border-gray-200">
                  <div className={`h-2 w-full ${
                    sfd.status === 'active' ? 'bg-green-500' : 
                    sfd.status === 'pending' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          {sfd.logo_url ? (
                            <img 
                              src={sfd.logo_url} 
                              alt={sfd.name} 
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path><path d="M3 9V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"></path></svg>';
                              }}
                            />
                          ) : (
                            <Building className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{sfd.name}</h3>
                          <p className="text-sm text-muted-foreground">Code: {sfd.code}</p>
                        </div>
                      </div>
                      <button className="text-gray-500 hover:text-gray-700">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      {sfd.region && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{sfd.region}</span>
                        </div>
                      )}
                      {sfd.contact_email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{sfd.contact_email}</span>
                        </div>
                      )}
                      {sfd.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{sfd.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{sfd.client_count || 0} clients</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge variant={
                        sfd.status === 'active' ? 'default' : 
                        sfd.status === 'pending' ? 'outline' : 
                        'destructive'
                      }>
                        {sfd.status === 'active' ? 'Actif' : 
                         sfd.status === 'pending' ? 'En attente' : 
                         'Suspendu'}
                      </Badge>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(sfd)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SfdAddDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
      
      {selectedSfd && (
        <SfdEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          sfd={selectedSfd}
          onSubmit={handleUpdateSfd}
          isLoading={updateSfdMutation.isPending}
        />
      )}
    </div>
  );
}
