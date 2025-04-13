
import React, { useState } from 'react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRight, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { Loan } from '@/types/sfdClients';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LoanCardProps {
  loan: Loan;
}

const getStatusData = (status: string): { label: string; icon: React.ReactNode; color: string } => {
  switch (status) {
    case 'pending':
      return { label: 'En attente', icon: <Clock className="h-4 w-4" />, color: 'text-amber-500 bg-amber-50 border-amber-200' };
    case 'approved':
      return { label: 'Approuvé', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500 bg-green-50 border-green-200' };
    case 'rejected':
      return { label: 'Rejeté', icon: <XCircle className="h-4 w-4" />, color: 'text-red-500 bg-red-50 border-red-200' };
    case 'active':
      return { label: 'Actif', icon: <CreditCard className="h-4 w-4" />, color: 'text-blue-500 bg-blue-50 border-blue-200' };
    case 'completed':
      return { label: 'Terminé', icon: <CheckCircle className="h-4 w-4" />, color: 'text-gray-500 bg-gray-50 border-gray-200' };
    default:
      return { label: status, icon: <Clock className="h-4 w-4" />, color: 'text-gray-500 bg-gray-50 border-gray-200' };
  }
};

const LoanCard: React.FC<LoanCardProps> = ({ loan }) => {
  const navigate = useNavigate();
  const statusData = getStatusData(loan.status);
  const createdAt = new Date(loan.created_at);
  
  return (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/mobile-flow/loan-details`, { state: { loanId: loan.id } })}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium">{loan.purpose}</h3>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(createdAt, { addSuffix: true, locale: fr })}
            </p>
          </div>
          <Badge className={`${statusData.color} flex items-center gap-1`}>
            {statusData.icon}
            <span>{statusData.label}</span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500">Montant</p>
            <p className="font-semibold">{loan.amount?.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Durée</p>
            <p className="font-semibold">{loan.duration_months} mois</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-[#0D6A51]">
            Détails <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const MobileMyLoansPage: React.FC = () => {
  const { loans, isLoading } = useClientLoans();
  const [tabValue, setTabValue] = useState("all");
  const navigate = useNavigate();
  
  // Filter loans based on tab selection
  const filteredLoans = loans.filter(loan => {
    if (tabValue === 'all') return true;
    if (tabValue === 'pending') return loan.status === 'pending';
    if (tabValue === 'active') return loan.status === 'approved' || loan.status === 'active';
    if (tabValue === 'completed') return loan.status === 'completed';
    return true;
  });
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Mes prêts</h1>
        <p className="text-gray-500 text-sm">Suivez vos demandes de prêt</p>
      </div>
      
      <div className="p-4">
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="active">Actifs</TabsTrigger>
            <TabsTrigger value="completed">Terminés</TabsTrigger>
          </TabsList>
          
          <TabsContent value={tabValue}>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <h3 className="text-lg font-medium mb-2">Aucun prêt</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Vous n'avez pas encore de prêt dans cette catégorie
                </p>
                <Button 
                  onClick={() => navigate('/mobile-flow/loan-application')}
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                >
                  Faire une demande
                </Button>
              </div>
            ) : (
              <div>
                {filteredLoans.map(loan => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileMyLoansPage;
