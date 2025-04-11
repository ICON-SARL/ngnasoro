
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { CreditCard, FilePlus, Users, ArrowRight } from 'lucide-react';
import { useSfdStatistics } from '@/hooks/useSfdStatistics';
import { Skeleton } from '@/components/ui/skeleton';

export const SfdDashboardStats = () => {
  const { data: stats, isLoading } = useSfdStatistics();
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tableau de bord</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="text-sm font-medium">Clients</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats?.clientsTotal || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              +{isLoading ? '...' : stats?.clientsNewThisMonth || 0} ce mois
            </p>
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
          <CardContent className="pt-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="text-sm font-medium">Prêts actifs</div>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats?.activeLoans || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {isLoading ? '...' : stats?.pendingApprovalLoans || 0} en attente d'approbation
            </p>
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
          <CardContent className="pt-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="text-sm font-medium">Demandes de subvention</div>
              <FilePlus className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats?.subsidyRequests || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {isLoading ? '...' : stats?.pendingSubsidyRequests || 0} en attente d'approbation
            </p>
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
