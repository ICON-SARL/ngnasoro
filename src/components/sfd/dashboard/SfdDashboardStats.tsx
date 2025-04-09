
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSfdClientStats } from '@/hooks/sfd/useSfdClientStats';
import { useSfdLoanStats } from '@/hooks/sfd/useSfdLoanStats';
import { Users, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

export function SfdDashboardStats() {
  const { activeSfdId } = useAuth();
  const { clientStats } = useSfdClientStats(activeSfdId);
  const { loanStats } = useSfdLoanStats(activeSfdId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md mr-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Clients Actifs</p>
              <h3 className="text-2xl font-bold">{clientStats.active}</h3>
              <p className="text-xs text-green-600">+{clientStats.new} ce mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md mr-4">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Prêts Actifs</p>
              <h3 className="text-2xl font-bold">{loanStats.active}</h3>
              <p className="text-xs text-muted-foreground">
                {loanStats.pending} en attente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md mr-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Prêts en Retard</p>
              <h3 className="text-2xl font-bold">{loanStats.overdue}</h3>
              <p className="text-xs text-yellow-600">Nécessite attention</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md mr-4">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Prêts Remboursés</p>
              <h3 className="text-2xl font-bold">{loanStats.completed}</h3>
              <p className="text-xs text-muted-foreground">
                {Math.round((loanStats.completed / loanStats.total) * 100)}% de taux
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
