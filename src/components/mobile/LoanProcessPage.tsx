
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, FileText, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const LoanProcessPage: React.FC = () => {
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
          navigate(-1);
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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'withdrawn':
        return 'Retiré';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };
  
  return (
    <div className="bg-white min-h-screen">
      <div className="p-4 flex items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold ml-2">Processus du prêt</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin h-8 w-8 border-t-2 border-r-2 border-[#0D6A51] rounded-full" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {loanData && (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center">
                    {getStatusIcon(loanData.status)}
                    <h2 className="text-lg font-bold ml-2">
                      Prêt {getStatusLabel(loanData.status)}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Montant</p>
                      <p className="font-bold">{loanData.amount.toFixed(2)} FCFA</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Institution</p>
                      <p className="font-bold">{loanData.sfds?.name || 'SFD'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Objectif</p>
                      <p className="font-bold">{loanData.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Durée</p>
                      <p className="font-bold">{loanData.duration_months} mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div>
                <h3 className="font-bold mb-2">Processus d'approbation</h3>
                <div className="border-l-2 border-gray-200 ml-3 pl-4 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-7 top-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Demande créée</p>
                      <p className="text-xs text-gray-500">
                        {new Date(loanData.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-7 top-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Examen par SFD</p>
                      {loanData.status === 'pending' ? (
                        <p className="text-xs text-orange-500">En cours</p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          {loanData.approved_at ? new Date(loanData.approved_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Non complété'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className={`absolute -left-7 top-0 h-5 w-5 rounded-full ${loanData.status === 'approved' || loanData.disbursed_at ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                      <CheckCircle2 className={`h-3 w-3 ${loanData.status === 'approved' || loanData.disbursed_at ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="font-semibold">Approbation finale</p>
                      {loanData.disbursed_at ? (
                        <p className="text-xs text-green-600">Complété</p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          {loanData.status === 'approved' ? 'En attente de déblocage' : 'Non complété'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className={`absolute -left-7 top-0 h-5 w-5 rounded-full ${loanData.disbursed_at ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                      <FileText className={`h-3 w-3 ${loanData.disbursed_at ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="font-semibold">Déblocage des fonds</p>
                      {loanData.disbursed_at ? (
                        <p className="text-xs text-gray-500">
                          {new Date(loanData.disbursed_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">Non complété</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-bold mb-2">Historique des activités</h3>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <Card key={activity.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start">
                            <div className="mt-1 mr-3">
                              {activity.activity_type === 'approval' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              {activity.activity_type === 'rejection' && <AlertCircle className="h-4 w-4 text-red-500" />}
                              {activity.activity_type === 'comment' && <FileText className="h-4 w-4 text-blue-500" />}
                              {activity.activity_type === 'payment' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </div>
                            <div>
                              <p className="font-medium">{activity.description}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <p>
                                  {activity.profiles?.full_name || 'Système'} • {new Date(activity.performed_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center p-4">Aucune activité enregistrée</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanProcessPage;
