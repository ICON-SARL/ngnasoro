
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ListFilter, User, Database, CreditCard } from 'lucide-react';

const MobileDiagnosticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [clientInfo, setClientInfo] = React.useState<any>(null);
  const [loans, setLoans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDiagnosticInfo = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user metadata
        setUserInfo({
          id: user.id,
          email: user.email,
          metadata: user.user_metadata || {},
          app_metadata: user.app_metadata || {}
        });
        
        // Fetch client info
        const { data: clientData } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('user_id', user.id);
          
        setClientInfo(clientData);
        
        // Fetch loans directly by user ID
        const { data: directLoans } = await supabase
          .from('sfd_loans')
          .select('*')
          .eq('client_id', user.id);
          
        // Fetch loans by client association
        let allLoans = directLoans || [];
        
        if (clientData && clientData.length > 0) {
          const clientIds = clientData.map((c: any) => c.id);
          
          const { data: clientLoans } = await supabase
            .from('sfd_loans')
            .select('*')
            .in('client_id', clientIds);
            
          if (clientLoans) {
            allLoans = [...allLoans, ...clientLoans];
          }
        }
        
        setLoans(allLoans);
      } catch (error) {
        console.error("Error fetching diagnostic info:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiagnosticInfo();
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <Button 
        variant="outline"
        className="mb-4" 
        onClick={() => navigate('/mobile-flow/main')}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      
      <CardHeader className="px-0">
        <CardTitle>Diagnostics de l'Application</CardTitle>
      </CardHeader>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-[#0D6A51] border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* User Info */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-[#0D6A51]" />
                <CardTitle className="text-lg">Informations Utilisateur</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p><strong>ID:</strong> {userInfo?.id || 'Non disponible'}</p>
                <p><strong>Email:</strong> {userInfo?.email || 'Non disponible'}</p>
                <p><strong>Rôle:</strong> {userInfo?.app_metadata?.role || 'user'}</p>
                <p><strong>SFD ID:</strong> {userInfo?.app_metadata?.sfd_id || userInfo?.user_metadata?.sfd_id || 'Non disponible'}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Client Info */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-[#0D6A51]" />
                <CardTitle className="text-lg">Enregistrements Client</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {clientInfo && clientInfo.length > 0 ? (
                <div className="space-y-4">
                  {clientInfo.map((client: any, index: number) => (
                    <div key={index} className="text-sm border-b pb-2 last:border-b-0 last:pb-0">
                      <p><strong>ID Client:</strong> {client.id}</p>
                      <p><strong>Nom:</strong> {client.full_name}</p>
                      <p><strong>SFD ID:</strong> {client.sfd_id}</p>
                      <p><strong>Status:</strong> {client.status}</p>
                      <p><strong>Date de création:</strong> {new Date(client.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun enregistrement client trouvé pour cet utilisateur</p>
              )}
            </CardContent>
          </Card>
          
          {/* Loans Info */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" />
                <CardTitle className="text-lg">Prêts Trouvés</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loans && loans.length > 0 ? (
                <div className="space-y-4">
                  {loans.map((loan: any, index: number) => (
                    <div key={index} className="text-sm border-b pb-2 last:border-b-0 last:pb-0">
                      <p><strong>ID Prêt:</strong> {loan.id}</p>
                      <p><strong>Client ID:</strong> {loan.client_id}</p>
                      <p><strong>SFD ID:</strong> {loan.sfd_id}</p>
                      <p><strong>Montant:</strong> {loan.amount?.toLocaleString() || 0} FCFA</p>
                      <p><strong>Status:</strong> {loan.status}</p>
                      <p><strong>Date de création:</strong> {new Date(loan.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun prêt trouvé pour cet utilisateur</p>
              )}
            </CardContent>
          </Card>
          
          <Button
            className="w-full"
            onClick={() => refetch()}
          >
            <ListFilter className="h-4 w-4 mr-2" />
            Rafraîchir les données
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileDiagnosticsPage;
