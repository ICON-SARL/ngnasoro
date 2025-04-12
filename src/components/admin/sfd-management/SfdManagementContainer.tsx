
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, UserCog, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SfdAddDialog } from './SfdAddDialog';

type Sfd = {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  contact_email?: string;
  logo_url?: string;
};

export const SfdManagementContainer = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Fetch SFDs
  const { data: sfds, isLoading, error } = useQuery({
    queryKey: ['sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Sfd[];
    },
  });
  
  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500">Suspendu</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des SFDs</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une SFD
        </Button>
      </div>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="font-medium text-red-600">Erreur de chargement</p>
                <p className="text-sm text-red-500">
                  {(error as any).message || "Impossible de charger les données des SFDs."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sfds?.map((sfd) => (
            <Card key={sfd.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      {sfd.logo_url ? (
                        <img
                          src={sfd.logo_url}
                          alt={sfd.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {sfd.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{sfd.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs font-medium text-gray-500">{sfd.code}</span>
                        {getStatusBadge(sfd.status)}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <span>Région:</span>
                    <span className="font-medium">{sfd.region || 'Non spécifiée'}</span>
                  </div>
                  {sfd.contact_email && (
                    <div className="flex items-center space-x-1 text-gray-500 mt-1">
                      <span>Email:</span>
                      <span className="font-medium">{sfd.contact_email}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <UserCog className="h-3 w-3 mr-1" />
                    Admins
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {sfds?.length === 0 && (
            <div className="col-span-full p-8 text-center">
              <p className="text-gray-500">Aucune SFD trouvée. Commencez par en créer une.</p>
            </div>
          )}
        </div>
      )}
      
      <SfdAddDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
};
