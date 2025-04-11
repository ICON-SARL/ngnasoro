
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientManagement } from '@/components/sfd/ClientManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NewClientForm } from '@/components/sfd/NewClientForm';
import { UserPlus, Users, UserCheck, Clock, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ClientManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [clientCounts, setClientCounts] = useState({
    total: 0,
    active: 0,
    pending: 0
  });
  
  // Fetch client counts when the component mounts
  useEffect(() => {
    // Simulate API call to get client counts
    const fetchClientCounts = async () => {
      // Mock data - in a real app, this would be an API call
      setClientCounts({
        total: 124,
        active: 89,
        pending: 35
      });
    };
    
    fetchClientCounts();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setStatusFilter(value === 'all' ? null : value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddClientSuccess = () => {
    setIsNewClientDialogOpen(false);
    // Refresh client data or increment counts
    setClientCounts(prev => ({
      ...prev,
      total: prev.total + 1,
      active: prev.active + 1
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestion des clients</h1>
        
        <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Remplissez le formulaire ci-dessous pour ajouter un nouveau client.
              </DialogDescription>
            </DialogHeader>
            <NewClientForm onSuccess={handleAddClientSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total des clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{clientCounts.total}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clients actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{clientCounts.active}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente de validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold">{clientCounts.pending}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="w-full flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-9"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous les clients</TabsTrigger>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="inactive">Inactifs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ClientManagement onSuccess={handleAddClientSuccess} />
        </TabsContent>
        
        <TabsContent value="active">
          <ClientManagement onSuccess={handleAddClientSuccess} />
        </TabsContent>
        
        <TabsContent value="pending">
          <ClientManagement onSuccess={handleAddClientSuccess} />
        </TabsContent>
        
        <TabsContent value="inactive">
          <ClientManagement onSuccess={handleAddClientSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
