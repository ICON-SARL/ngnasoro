
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSfdClientStats } from '@/hooks/sfd/useSfdClientStats';
import { useSfdLoanStats } from '@/hooks/sfd/useSfdLoanStats';
import { useAuth } from '@/hooks/useAuth';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { LoanSummaryChart } from './analytics/LoanSummaryChart';
import { ClientActivityChart } from './analytics/ClientActivityChart';
import { CurrentSfdBadge } from './CurrentSfdBadge';
import { Users, CreditCard, Clock, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { PermissionsTable } from '@/components/admin/PermissionsTable';

export function SfdDashboard() {
  const { activeSfdId, user } = useAuth();
  const { clientStats } = useSfdClientStats(activeSfdId);
  const { loanStats } = useSfdLoanStats(activeSfdId);
  const { isSfdAdmin, canManageClients } = useRolePermissions();
  
  // Get the staff role from user_metadata (if any)
  const staffRole = user?.user_metadata?.staff_role;
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord SFD</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue sur votre espace de gestion SFD
          </p>
        </div>
        <CurrentSfdBadge />
      </div>
      
      {isSfdAdmin ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients Total</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientStats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {clientStats.active} clients actifs
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prêts Actifs</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loanStats.active}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  sur {loanStats.total} prêts
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loanStats.pending}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  demandes de prêts à traiter
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Retard</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loanStats.overdue}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  prêts avec paiements en retard
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <LoanSummaryChart sfdId={activeSfdId} staffRole={staffRole} />
            <ClientActivityChart sfdId={activeSfdId} staffRole={staffRole} />
          </div>
          
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Structure des Permissions
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble hiérarchique des rôles et permissions dans le système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start">
                      <strong className="min-w-[120px]">MEREF:</strong>
                      <span>Contrôle macro (règles, conformité, supervision générale)</span>
                    </div>
                    <div className="flex items-start">
                      <strong className="min-w-[120px]">Admin SFD:</strong>
                      <span>Gestion opérationnelle (clients, prêts, personnel de la SFD)</span>
                    </div>
                    <div className="flex items-start">
                      <strong className="min-w-[120px]">Personnel SFD:</strong>
                      <span>Opérations quotidiennes selon le rôle attribué (caisse, crédit, etc.)</span>
                    </div>
                    <div className="flex items-start">
                      <strong className="min-w-[120px]">Clients:</strong>
                      <span>Interactions self-service (consultation compte, demande de prêt)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <PermissionsTable />
        </>
      ) : (
        <StaffDashboard staffRole={staffRole} />
      )}
    </div>
  );
}

// Dashboard for staff members with limited permissions
function StaffDashboard({ staffRole }: { staffRole?: string }) {
  const { activeSfdId } = useAuth();
  const { canViewTransactions, canApproveLoan } = useRolePermissions();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tableau de Bord {staffRole ? `- ${staffRole}` : ''}</CardTitle>
          <CardDescription>
            Bienvenue sur votre espace de travail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-md">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-medium">Rôle: {staffRole || 'Personnel SFD'}</h3>
                <p className="text-sm text-muted-foreground">
                  Votre accès est limité selon votre rôle dans l'organisation
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {canViewTransactions(staffRole) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Vous avez accès à la visualisation des transactions
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {canApproveLoan(staffRole) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Prêts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Vous pouvez approuver des demandes de prêts
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {canViewTransactions(staffRole) && (
        <div className="grid gap-4 md:grid-cols-2">
          <LoanSummaryChart sfdId={activeSfdId} staffRole={staffRole} />
          <ClientActivityChart sfdId={activeSfdId} staffRole={staffRole} />
        </div>
      )}
    </div>
  );
}
