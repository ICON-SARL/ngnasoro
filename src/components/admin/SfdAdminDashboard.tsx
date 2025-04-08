
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SfdDashboardStats } from '@/components/sfd/dashboard';
import { CreditTrendChart } from '@/components/sfd/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, FileText, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';

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
              <CardTitle>Demandes de Subvention</CardTitle>
              <CardDescription>
                Demandes en attente de décision
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Chargement des demandes...</p>
              ) : subsidyRequests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Aucune demande en attente</p>
                  <Button 
                    onClick={() => navigate('/sfd-subsidy-requests?tab=create')}
                    className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nouvelle Demande
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {subsidyRequests.slice(0, 5).map(request => (
                    <div key={request.id} className="border rounded p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{request.purpose}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(request.amount)}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/sfd-subsidy-requests/${request.id}`)}
                      >
                        Détails
                      </Button>
                    </div>
                  ))}
                  
                  {subsidyRequests.length > 5 && (
                    <Button 
                      variant="link" 
                      className="w-full" 
                      onClick={() => navigate('/sfd-subsidy-requests')}
                    >
                      Voir toutes les demandes ({subsidyRequests.length})
                    </Button>
                  )}
                  
                  <Button 
                    className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    onClick={() => navigate('/sfd-subsidy-requests?tab=create')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nouvelle Demande
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SfdAdminDashboard;
