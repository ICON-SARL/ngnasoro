
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, ChevronRight, Clock, ChevronsDown, ChevronsUp, FileText, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const LoanStatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string; variant: string }> = {
    pending: { label: 'En attente', variant: 'bg-amber-100 text-amber-800' },
    approved: { label: 'Approuvé', variant: 'bg-blue-100 text-blue-800' },
    active: { label: 'Actif', variant: 'bg-green-100 text-green-800' },
    completed: { label: 'Terminé', variant: 'bg-gray-100 text-gray-800' },
    rejected: { label: 'Rejeté', variant: 'bg-red-100 text-red-800' },
    defaulted: { label: 'En défaut', variant: 'bg-purple-100 text-purple-800' },
  };

  const { label, variant } = statusMap[status] || { label: status, variant: 'bg-gray-100 text-gray-800' };

  return <Badge className={variant}>{label}</Badge>;
};

interface LoanType {
  id: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  purpose: string;
  status: string;
  created_at: string;
  last_payment_date?: string;
  next_payment_date?: string;
  sfd: {
    id: string;
    name: string;
  };
}

const LoanCard = ({ loan, onViewDetails }: { loan: LoanType; onViewDetails: (loanId: string) => void }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{loan.purpose}</CardTitle>
              <LoanStatusBadge status={loan.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              SFD: {loan.sfd.name}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{loan.amount.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-sm text-gray-500">
              {loan.duration_months} mois à {loan.interest_rate}%
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center text-sm mb-3">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(loan.created_at), 'dd MMM yyyy', { locale: fr })}</span>
          </div>
          
          {loan.status === 'active' && loan.next_payment_date && (
            <div className="flex items-center gap-1 text-[#0D6A51]">
              <CreditCard className="h-4 w-4" />
              <span>Prochaine échéance: {format(new Date(loan.next_payment_date), 'dd MMM yyyy', { locale: fr })}</span>
            </div>
          )}
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium mb-2">Détails du prêt</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Mensualité</p>
                <p className="font-medium">{loan.monthly_payment.toLocaleString('fr-FR')} FCFA</p>
              </div>
              
              {loan.last_payment_date && (
                <div>
                  <p className="text-gray-500">Dernier paiement</p>
                  <p className="font-medium">{format(new Date(loan.last_payment_date), 'dd MMM yyyy', { locale: fr })}</p>
                </div>
              )}
              
              {loan.status === 'rejected' && (
                <div className="col-span-2">
                  <p className="text-gray-500">Motif de rejet</p>
                  <p className="font-medium text-red-600">Demande non approuvée par la SFD</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronsUp className="h-4 w-4 mr-1" />
                Réduire
              </>
            ) : (
              <>
                <ChevronsDown className="h-4 w-4 mr-1" />
                Détails
              </>
            )}
          </Button>
          
          <div className="flex gap-2">
            {loan.status === 'active' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-[#0D6A51] border-[#0D6A51]"
                onClick={() => onViewDetails(loan.id)}
              >
                <Coins className="h-4 w-4 mr-1" />
                Rembourser
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(loan.id)}
            >
              <FileText className="h-4 w-4 mr-1" />
              Voir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ onNewLoan }: { onNewLoan: () => void }) => (
  <div className="text-center py-8">
    <div className="mx-auto h-12 w-12 rounded-full bg-[#0D6A51]/10 flex items-center justify-center">
      <CreditCard className="h-6 w-6 text-[#0D6A51]" />
    </div>
    <h3 className="mt-4 text-lg font-medium">Aucun prêt trouvé</h3>
    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
      Vous n'avez pas encore de prêt ou de demande en cours. Commencez par soumettre une demande à votre SFD.
    </p>
    <Button 
      className="mt-5 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
      onClick={onNewLoan}
    >
      Demander un prêt
    </Button>
  </div>
);

const LoanActivityPage: React.FC = () => {
  const [loans, setLoans] = useState<LoanType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchLoans = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // First, get all client IDs for this user
        const { data: clientsData, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id, sfd_id')
          .eq('user_id', user.id);
          
        if (clientsError) throw clientsError;
        
        if (!clientsData || clientsData.length === 0) {
          setLoans([]);
          return;
        }
        
        // Get client IDs
        const clientIds = clientsData.map(client => client.id);
        
        // Get loans for these clients
        const { data: loansData, error: loansError } = await supabase
          .from('sfd_loans')
          .select(`
            id,
            amount,
            duration_months,
            interest_rate,
            monthly_payment,
            purpose,
            status,
            created_at,
            last_payment_date,
            next_payment_date,
            sfd:sfd_id(id, name)
          `)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });
          
        if (loansError) throw loansError;
        
        setLoans(loansData as unknown as LoanType[]);
      } catch (error) {
        console.error("Error fetching loans:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos prêts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoans();
  }, [user, toast]);
  
  const handleViewDetails = (loanId: string) => {
    navigate('/mobile-flow/loan-details', { state: { loanId } });
  };
  
  const handleNewLoan = () => {
    navigate('/mobile-flow/loan-application');
  };
  
  return (
    <div className="container px-4 py-6">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0" 
        onClick={() => navigate('/mobile-flow/main')}
      >
        ← Accueil
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0D6A51]">Mes prêts</h1>
        <Button 
          onClick={handleNewLoan}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          Nouveau prêt
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51]" />
        </div>
      ) : loans.length === 0 ? (
        <EmptyState onNewLoan={handleNewLoan} />
      ) : (
        <div className="space-y-4">
          {loans.map(loan => (
            <LoanCard 
              key={loan.id} 
              loan={loan} 
              onViewDetails={handleViewDetails} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanActivityPage;
