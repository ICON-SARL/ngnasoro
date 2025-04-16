
import React, { useState } from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Building, User, MapPin, Mail, Phone, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components';
import { SfdAddDialog } from '@/components/admin/sfd-management/SfdAddDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Sfd {
  id: string;
  name: string;
  code: string;
  region: string;
  status: string;
  contact_email: string;
  phone: string;
  description?: string;
  logo_url?: string;
}

export default function SfdManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: sfds = [], isLoading, refetch } = useQuery({
    queryKey: ['sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      return data as Sfd[];
    }
  });
  
  const activateSfd = async (sfdId: string) => {
    try {
      const { error } = await supabase
        .from('sfds')
        .update({ status: 'active' })
        .eq('id', sfdId);
        
      if (error) throw error;
      
      refetch();
      toast({
        title: 'SFD activée',
        description: 'La SFD a été activée avec succès',
      });
    } catch (err) {
      console.error('Error activating SFD:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer la SFD',
        variant: 'destructive',
      });
    }
  };

  const filteredSfds = sfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sfd.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (sfd.region && sfd.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Gestion des SFDs</h2>
          <p className="text-muted-foreground">
            Administrez les institutions de microfinance partenaires
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
            >
              <RefreshCw className="h-4 w-4 mr-2" />
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
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSfds.length === 0 ? (
              <div className="text-center p-8 bg-muted/20 rounded-md">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucun SFD trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSfds.map(sfd => (
                  <Card key={sfd.id} className="overflow-hidden border-gray-200">
                    <div className={`h-2 w-full ${sfd.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Building className="h-6 w-6 text-primary" />
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
                          <span>0 clients</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant={sfd.status === 'active' ? 'default' : 'destructive'}>
                          {sfd.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                        {sfd.status !== 'active' ? (
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => activateSfd(sfd.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Activer
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            Gérer
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <SfdAddDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
      
      <Footer />
    </div>
  );
}
