
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SfdDashboardStats } from '@/components/sfd/dashboard';
import { CreditTrendChart } from '@/components/sfd/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, FileText, CreditCard, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { useSfdClients } from '@/hooks/useSfdClients';

export function SfdAdminDashboard() {
  const navigate = useNavigate();
  const { subsidyRequests, isLoading } = useSubsidyRequests({ 
    status: 'pending',
    sfdId: undefined // It will use the active SFD ID from auth context
  });
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AgencyHeader />
      
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tableau de Bord SFD</h1>
            <p className="text-muted-foreground">
              Gérez vos clients, crédits et demandes de subvention
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => navigate('/sfd-clients')}
            >
              <Users className="h-4 w-4" />
              Gérer les Clients
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => navigate('/sfd-subsidy-requests')}
            >
              <FileText className="h-4 w-4" />
              Demandes de Subvention
            </Button>
            <Button 
              className="flex items-center gap-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => navigate('/sfd-loans')}
            >
              <CreditCard className="h-4 w-4" />
              Gérer les Crédits
            </Button>
          </div>
        </div>
        
        <SfdDashboardStats />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <CreditTrendChart />
          
          <Card>
            <CardHeader>
              <CardTitle>Clients récents</CardTitle>
              <CardDescription>
                Nouveaux clients en attente de validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientsList />
            </CardContent>
            <CardFooter>
              <Button 
                variant="link" 
                className="w-full justify-center" 
                onClick={() => navigate('/sfd-clients')}
              >
                Voir tous les clients
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

const ClientsList = () => {
  const { clients, isLoading } = useSfdClients();
  const pendingClients = clients.filter(client => client.status === 'pending').slice(0, 3);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-3">
            <div className="skeleton h-10 w-10 rounded-full"></div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-36"></div>
              <div className="skeleton h-3 w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (pendingClients.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <User className="h-10 w-10 mx-auto text-gray-300 mb-2" />
        <p>Aucun client en attente</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {pendingClients.map(client => (
        <div key={client.id} className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-sm">{client.full_name}</p>
              <p className="text-xs text-gray-500">{client.phone || client.email || 'Pas de contact'}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-600">En attente</Badge>
        </div>
      ))}
    </div>
  );
};

export default SfdAdminDashboard;
