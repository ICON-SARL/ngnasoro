
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, FileBarChart, Clock, FileText } from 'lucide-react';
import { SfdDashboardStats } from '@/components/sfd/dashboard/SfdDashboardStats';
import { useSfdClients } from '@/hooks/useSfdClients';
import { useLoansPage } from '@/hooks/sfd/useLoansPage';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import LoanList from '../sfd/loans/LoanList';

export function SfdDashboard() {
  const navigate = useNavigate();
  const { clients, isLoading: isLoadingClients } = useSfdClients();
  const { loans, isLoading: isLoadingLoans } = useLoansPage();
  
  // Filter recent clients and loans
  const recentClients = clients?.slice(0, 3) || [];
  const recentLoans = loans?.slice(0, 3) || [];
  
  return (
    <div className="space-y-6 p-6">
      <SfdDashboardStats />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Nouveaux clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingClients ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentClients.length > 0 ? (
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">{client.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Inscrit le {formatDate(client.created_at)}
                      </div>
                    </div>
                    <div className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      {client.status === 'validated' ? 'Actif' : 'En attente'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Aucun client récent</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => navigate('/sfd-clients')}
            >
              Voir tous les clients
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Prêts récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingLoans ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentLoans.length > 0 ? (
              <div className="space-y-4">
                {recentLoans.map((loan) => (
                  <div key={loan.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">Prêt #{loan.reference || loan.id.substring(0, 6)}</div>
                      <div className="text-sm text-muted-foreground">
                        {loan.amount.toLocaleString()} FCFA sur {loan.duration_months} mois
                      </div>
                    </div>
                    <div className={`text-sm px-2 py-1 rounded
                      ${loan.status === 'active' ? 'bg-green-50 text-green-600' : 
                       loan.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                       'bg-gray-50 text-gray-600'}
                    `}>
                      {loan.status === 'active' ? 'Actif' : 
                       loan.status === 'pending' ? 'En attente' : 
                       loan.status === 'approved' ? 'Approuvé' : 
                       loan.status === 'completed' ? 'Terminé' : 
                       loan.status === 'rejected' ? 'Rejeté' : 'Inconnu'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Aucun prêt récent</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => navigate('/sfd-loans')}
            >
              Voir tous les prêts
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Prêts en attente d'approbation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoanList 
            loans={loans?.filter(loan => loan.status === 'pending')} 
            loading={isLoadingLoans} 
          />
          {!isLoadingLoans && loans?.filter(loan => loan.status === 'pending').length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Aucun prêt en attente d'approbation</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
