
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, FileText, User, Building, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LoanProcessDiagram from '@/components/mobile/loan/LoanProcessDiagram';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const MobileLoanProcessPage: React.FC = () => {
  const navigate = useNavigate();
  const { loanId } = useParams<{ loanId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loanData, setLoanData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true);
        
        if (!loanId) {
          toast({
            title: "Erreur",
            description: "Identifiant de prêt manquant",
            variant: "destructive",
          });
          navigate('/mobile-flow/loans');
          return;
        }
        
        // Récupérer les données du prêt
        const { data: loanData, error: loanError } = await supabase
          .from('sfd_loans')
          .select(`
            id,
            amount,
            interest_rate,
            duration_months,
            monthly_payment,
            purpose,
            status,
            created_at,
            approved_at,
            approved_by,
            disbursed_at,
            client_id,
            sfd_id,
            sfds(name, code)
          `)
          .eq('id', loanId)
          .single();
          
        if (loanError) throw loanError;
        
        setLoanData(loanData);
        
        // Récupérer les activités du prêt
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('loan_activities')
          .select(`
            id,
            activity_type,
            description,
            performed_at,
            performed_by,
            profiles(full_name)
          `)
          .eq('loan_id', loanId)
          .order('performed_at', { ascending: false });
          
        if (activitiesError) throw activitiesError;
        
        setActivities(activitiesData || []);
        
      } catch (error) {
        console.error('Error fetching loan process data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les données du processus de prêt",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanData();
  }, [loanId, navigate, toast]);
  
  const getLoanStage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'verification';
      case 'approved':
        return 'approval';
      case 'active':
        return 'disbursement';
      case 'completed':
        return 'completed';
      case 'rejected':
        return 'verification';
      default:
        return 'application';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approuvé</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  if (loading) {
    return (
      <MobileLayout>
        <div className="p-4 flex justify-center items-center min-h-[80vh]">
          <p className="text-gray-500">Chargement des informations du prêt...</p>
        </div>
      </MobileLayout>
    );
  }
  
  if (!loanData) {
    return (
      <MobileLayout>
        <div className="p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/mobile-flow/loans')}
            className="mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Retour
          </Button>
          <div className="text-center p-8">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-lg font-medium">Prêt non trouvé</h2>
            <p className="text-gray-500 mt-2">
              Les informations concernant ce prêt sont indisponibles.
            </p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/mobile-flow/loans')}
            >
              Voir mes prêts
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout>
      <div className="p-4 pb-16">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/mobile-flow/loans')}
          className="p-1 mb-2"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Retour
        </Button>
        
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Demande de Prêt</h1>
          {getStatusBadge(loanData.status)}
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="mt-2 mb-4">
              <LoanProcessDiagram currentStage={getLoanStage(loanData.status)} />
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-[#0D6A51] mr-2" />
                  <span className="text-gray-500">Montant:</span>
                </div>
                <span className="font-medium">{loanData.amount.toLocaleString()} FCFA</span>
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-[#0D6A51] mr-2" />
                  <span className="text-gray-500">Durée:</span>
                </div>
                <span className="font-medium">{loanData.duration_months} mois</span>
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-[#0D6A51] mr-2" />
                  <span className="text-gray-500">Paiement mensuel:</span>
                </div>
                <span className="font-medium">{loanData.monthly_payment?.toLocaleString()} FCFA</span>
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-[#0D6A51] mr-2" />
                  <span className="text-gray-500">Objet:</span>
                </div>
                <span className="font-medium">{loanData.purpose}</span>
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-[#0D6A51] mr-2" />
                  <span className="text-gray-500">SFD:</span>
                </div>
                <span className="font-medium">{loanData.sfds?.name || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <h2 className="text-lg font-semibold mt-6 mb-3">Historique</h2>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={activity.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">
                        {activity.activity_type === 'status_change' ? 'Changement de statut' :
                         activity.activity_type === 'payment_recorded' ? 'Paiement enregistré' :
                         activity.activity_type === 'disbursement' ? 'Décaissement' :
                         activity.activity_type === 'comment_added' ? 'Commentaire ajouté' :
                         activity.activity_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(activity.performed_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucune activité enregistrée</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <Button 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            onClick={() => navigate('/mobile-flow/loan-process-flow')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Voir le processus complet
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileLoanProcessPage;
