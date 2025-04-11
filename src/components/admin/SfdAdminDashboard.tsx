
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SfdDashboardStats, PendingSubsidies } from '@/components/sfd/dashboard';
import { CreditTrendChart } from '@/components/sfd/analytics';
import { Button } from '@/components/ui/button';
import { Users, FileText, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSfdData } from '@/hooks/useSfdData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export function SfdAdminDashboard() {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { data: sfdData, isLoading: sfdLoading } = useSfdData(activeSfdId);
  
  if (sfdLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AgencyHeader />
        <div className="flex flex-col items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Chargement des données SFD...</p>
        </div>
      </div>
    );
  }

  if (!activeSfdId || !sfdData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AgencyHeader />
        <div className="container mx-auto p-4 md:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de configuration</AlertTitle>
            <AlertDescription>
              <p className="mb-4">Aucune SFD active n'a été détectée pour votre compte. Veuillez contacter un administrateur.</p>
              <Button onClick={() => navigate('/')} variant="outline">
                Retour à l'accueil
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AgencyHeader />
      
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tableau de Bord SFD</h1>
            <p className="text-muted-foreground">
              {sfdData?.name} - Gestion des clients, crédits et demandes de subvention
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
          <PendingSubsidies />
        </div>
      </div>
    </div>
  );
}

export default SfdAdminDashboard;
