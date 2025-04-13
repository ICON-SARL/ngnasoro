
import React, { useState } from 'react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRight, Clock, CheckCircle, XCircle, CreditCard, Plus, ScrollText, Wallet } from 'lucide-react';
import { Loan } from '@/types/sfdClients';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import MobileHeader from './MobileHeader';

interface LoanCardProps {
  loan: Loan;
}

const getStatusData = (status: string): { label: string; icon: React.ReactNode; color: string } => {
  switch (status) {
    case 'pending':
      return { label: 'En attente', icon: <Clock className="h-4 w-4" />, color: 'bg-amber-50 text-amber-600 border-amber-200' };
    case 'approved':
      return { label: 'Approuvé', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-50 text-green-600 border-green-200' };
    case 'rejected':
      return { label: 'Rejeté', icon: <XCircle className="h-4 w-4" />, color: 'bg-red-50 text-red-600 border-red-200' };
    case 'active':
      return { label: 'Actif', icon: <CreditCard className="h-4 w-4" />, color: 'bg-blue-50 text-blue-600 border-blue-200' };
    case 'completed':
      return { label: 'Terminé', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-gray-50 text-gray-600 border-gray-200' };
    default:
      return { label: status, icon: <Clock className="h-4 w-4" />, color: 'bg-gray-50 text-gray-600 border-gray-200' };
  }
};

const LoanCard: React.FC<LoanCardProps> = ({ loan }) => {
  const navigate = useNavigate();
  const statusData = getStatusData(loan.status);
  const createdAt = new Date(loan.created_at);
  
  return (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow rounded-2xl border border-gray-100 overflow-hidden" onClick={() => navigate(`/mobile-flow/loan/${loan.id}`)}>
      <div className="h-2 bg-gradient-to-r from-[#0D6A51] to-[#33C3F0]"></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-gray-800">{loan.purpose}</h3>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(createdAt, { addSuffix: true, locale: fr })}
            </p>
          </div>
          <Badge className={`flex items-center gap-1 ${statusData.color} rounded-full px-3 py-1 font-medium border shadow-sm`}>
            {statusData.icon}
            <span>{statusData.label}</span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Montant</p>
            <p className="font-semibold text-gray-800">{loan.amount?.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Durée</p>
            <p className="font-semibold text-gray-800">{loan.duration_months} mois</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-[#0D6A51] hover:bg-[#0D6A51]/10 rounded-full">
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
  
  const tabCounts = {
    all: loans.length,
    pending: loans.filter(loan => loan.status === 'pending').length,
    active: loans.filter(loan => loan.status === 'approved' || loan.status === 'active').length,
    rejected: loans.filter(loan => loan.status === 'rejected').length,
    completed: loans.filter(loan => loan.status === 'completed').length,
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-[#0D6A51] to-[#064032] text-white rounded-b-3xl shadow-lg">
        <MobileHeader title="Mes demandes de prêt" />
        <div className="px-6 pb-6">
          <p className="text-white/80">Suivez l'état de vos demandes de prêt et leur traitement</p>
        </div>
      </div>
      
      <div className="p-4 -mt-4">
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
              <TabsList className="grid grid-cols-4 bg-gray-100/80 p-1 rounded-xl w-full">
                <TabsTrigger 
                  value="all" 
                  className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-[#0D6A51] data-[state=active]:shadow-sm"
                >
                  <ScrollText className="h-3.5 w-3.5 mr-1.5" />
                  Tous ({tabCounts.all})
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Attente ({tabCounts.pending})
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                  Actifs ({tabCounts.active})
                </TabsTrigger>
                <TabsTrigger 
                  value="rejected" 
                  className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Rejetés ({tabCounts.rejected})
                </TabsTrigger>
              </TabsList>
              
              <div className="p-4">
                <TabsContent value={tabValue} className="focus-visible:outline-none focus-visible:ring-0 mt-0">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
                    </div>
                  ) : filteredLoans.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl shadow-sm p-8">
                      <div className="bg-[#0D6A51]/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="h-8 w-8 text-[#0D6A51]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-800">Aucun prêt</h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                        Vous n'avez pas encore de prêt dans cette catégorie
                      </p>
                      <Button 
                        onClick={() => navigate('/loans/apply')}
                        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Faire une demande
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredLoans.map(loan => (
                        <LoanCard key={loan.id} loan={loan} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="fixed bottom-24 right-4">
        <Button 
          onClick={() => navigate('/loans/apply')}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileMyLoansPage;
