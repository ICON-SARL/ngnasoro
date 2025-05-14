
import React, { useEffect, useState } from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, CreditCard, Loader2, List, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useClientLoans } from '@/hooks/useClientLoans';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const MobileLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const [sfdName, setSfdName] = useState<string>('votre SFD');
  const { data: plans = [] } = useSfdLoanPlans();
  const { loans = [], isLoading: isLoadingLoans, refetch } = useClientLoans();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Refetch loans when component mounts
  useEffect(() => {
    console.log("MobileLoansPage mounted, refetching loans...");
    refetch();
  }, [refetch]);

  // Filtrer les prêts en fonction du terme de recherche
  const filteredLoans = loans.filter(loan => 
    loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loan.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Si des plans sont disponibles, récupérer le nom de la SFD du premier plan
    if (plans && plans.length > 0 && plans[0].sfds) {
      setSfdName(plans[0].sfds.name || 'votre SFD');
    }
  }, [plans]);

  useEffect(() => {
    // Log current loans for debugging
    console.log("Current loans in MobileLoansPage:", loans);
  }, [loans]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Remboursé</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      case 'approved':
        return <Badge className="bg-teal-100 text-teal-800">Approuvé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-teal-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date inconnue';
    }
  };

  const handleApplyForLoan = () => {
    if (!activeSfdId) {
      toast({
        title: "SFD requise",
        description: "Vous devez être lié à une SFD pour faire une demande de prêt",
        variant: "destructive"
      });
      return;
    }
    navigate('/mobile-flow/loan-plans');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Mes Prêts</h1>
        <p className="text-gray-500 text-sm">Suivez l'état de vos demandes de prêt</p>
      </div>
      
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            type="text"
            placeholder="Rechercher un prêt..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mt-4 mb-4">
          <Button
            onClick={handleApplyForLoan}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Faire une demande de prêt
          </Button>
        </div>
        
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-4">Mes demandes de prêt</h2>
          
          {isLoadingLoans ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-[#0D6A51] animate-spin" />
            </div>
          ) : filteredLoans.length === 0 ? (
            <Card className="border rounded-md shadow-sm">
              <CardContent className="p-6 text-center">
                <List className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">Aucun prêt trouvé{searchTerm ? " pour cette recherche" : ""}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchTerm ? 
                    "Essayez avec d'autres termes de recherche" : 
                    "Vous n'avez pas encore fait de demande de prêt"
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchTerm('')}
                    className="mt-4"
                  >
                    Effacer la recherche
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredLoans.map((loan) => (
                <Card key={loan.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-gray-100">
                          {getStatusIcon(loan.status)}
                        </div>
                        <div>
                          <h3 className="font-medium">{loan.purpose}</h3>
                          <p className="text-xs text-gray-600">
                            {formatDate(loan.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(loan.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Montant:</p>
                        <p className="font-medium">{loan.amount.toLocaleString()} FCFA</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Durée:</p>
                        <p className="font-medium">{loan.duration_months} mois</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Mensualité:</p>
                        <p className="font-medium">{loan.monthly_payment?.toLocaleString() || '-'} FCFA</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Taux:</p>
                        <p className="font-medium">{loan.interest_rate}%</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/mobile-flow/loan-details/${loan.id}`)}
                      >
                        Voir les détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileLoansPage;
