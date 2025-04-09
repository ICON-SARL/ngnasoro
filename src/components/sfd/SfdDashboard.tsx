
import React, { useState, useEffect } from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SfdDashboardStats } from '@/components/sfd/dashboard/SfdDashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { SfdSelector } from '@/components/sfd/SfdSelector';
import { 
  ChevronRight, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  FileText,
  TrendingUp
} from 'lucide-react';
import { useSfdClientStats } from '@/hooks/sfd/useSfdClientStats';
import { useSfdLoanStats } from '@/hooks/sfd/useSfdLoanStats';
import { useSfdSubsidyRequests } from '@/hooks/sfd/useSfdSubsidyRequests';
import { ClientActivityChart } from '@/components/sfd/analytics/ClientActivityChart';
import { LoanSummaryChart } from '@/components/sfd/analytics/LoanSummaryChart';
import { SfdPerformanceMetrics } from '@/components/sfd/analytics/SfdPerformanceMetrics';
import { InitializeDemoData } from '@/components/sfd/InitializeDemoData';

export function SfdDashboard() {
  const { user, activeSfdId } = useAuth();
  const navigate = useNavigate();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { clientStats } = useSfdClientStats(activeSfdId);
  const { loanStats } = useSfdLoanStats(activeSfdId);
  const { subsidyRequests } = useSfdSubsidyRequests({ 
    status: 'pending',
    sfdId: activeSfdId
  });

  // Si l'utilisateur est un admin SFD mais n'a pas de SFD activé,
  // ouvrir le sélecteur uniquement pour la première sélection
  useEffect(() => {
    if (!activeSfdId) {
      setSelectorOpen(true);
    }
  }, [activeSfdId]);

  if (!activeSfdId && !selectorOpen) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
              Aucun SFD sélectionné
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              Vous devez sélectionner un SFD pour accéder au tableau de bord.
            </p>
            <Button 
              onClick={() => setSelectorOpen(true)}
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              Sélectionner un SFD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      {/* SFD Selector Dialog - uniquement pour la première sélection */}
      <SfdSelector 
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSfdSelected={() => setSelectorOpen(false)}
        disableReselection={true}  // Empêche les admins SFD de changer de SFD après sélection
      />
      
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tableau de Bord SFD</h1>
            <p className="text-muted-foreground">
              Gérez vos clients, crédits et demandes de subvention
            </p>
          </div>
          
          <div className="flex space-x-2">
            <InitializeDemoData />
            {/* Le bouton de changement de SFD a été retiré pour les admins SFD */}
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => navigate('/sfd/clients')}
            >
              <Users className="h-4 w-4" />
              Gérer les Clients
            </Button>
            <Button 
              className="flex items-center gap-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => navigate('/sfd/loans')}
            >
              <CreditCard className="h-4 w-4" />
              Gérer les Crédits
            </Button>
          </div>
        </div>
        
        <SfdDashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Activité des clients</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientActivityChart sfdId={activeSfdId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Crédits par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <LoanSummaryChart sfdId={activeSfdId} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Demandes récentes</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs flex items-center"
                onClick={() => navigate('/sfd/subsidy-requests')}
              >
                Voir tout
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {subsidyRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune demande récente
                </div>
              ) : (
                <div className="space-y-4">
                  {subsidyRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{request.purpose}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(request.amount)}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/sfd/subsidy-requests/${request.id}`)}
                      >
                        Détails
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <SfdPerformanceMetrics sfdId={activeSfdId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SfdDashboard;
