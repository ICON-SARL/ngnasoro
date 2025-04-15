
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Users, CreditCard, FileText } from 'lucide-react';
import { useSfdStatistics } from '@/hooks/useSfdStatistics';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStats() {
  const { data: stats, isLoading } = useSfdStatistics();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-6 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-2xl font-bold">{stats?.clientsTotal || 0}</h3>
            <p className="text-sm text-muted-foreground">Clients</p>
            <p className="text-xs text-muted-foreground">
              +{stats?.clientsNewThisMonth || 0} ce mois
            </p>
            <Link 
              to="/sfd-clients"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Gérer les clients →
            </Link>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <CreditCard className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-2xl font-bold">{stats?.activeLoans || 0}</h3>
            <p className="text-sm text-muted-foreground">Prêts actifs</p>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingApprovalLoans || 0} en attente d'approbation
            </p>
            <Link 
              to="/sfd-loans"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Gérer les prêts →
            </Link>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-2xl font-bold">{stats?.subsidyRequests || 0}</h3>
            <p className="text-sm text-muted-foreground">Demandes de subvention</p>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingSubsidyRequests || 0} en attente d'approbation
            </p>
            <Link 
              to="/sfd-subsidy-requests"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Voir les demandes →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
