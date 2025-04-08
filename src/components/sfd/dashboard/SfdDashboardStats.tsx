
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { CreditCard, FilePlus, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export const SfdDashboardStats = () => {
  const { stats, isLoading } = useDashboardStats();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Chargement des données...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tableau de bord</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clients.total}</div>
            <p className="text-xs text-muted-foreground">+{stats.clients.newThisMonth} ce mois</p>
            <div className="mt-4">
              <Link 
                to="/sfd-clients" 
                className="text-sm inline-flex items-center text-primary"
              >
                Gérer les clients
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prêts actifs</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loans.active}</div>
            <p className="text-xs text-muted-foreground">{stats.loans.pending} en attente d'approbation</p>
            <div className="mt-4">
              <Link 
                to="/sfd-loans" 
                className="text-sm inline-flex items-center text-primary"
              >
                Gérer les prêts
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Demandes de subvention</CardTitle>
            <FilePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subsidyRequests.total}</div>
            <p className="text-xs text-muted-foreground">{stats.subsidyRequests.pending} en attente d'approbation</p>
            <div className="mt-4">
              <Link 
                to="/sfd-subsidy-requests" 
                className="text-sm inline-flex items-center text-primary"
              >
                Voir les demandes
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
