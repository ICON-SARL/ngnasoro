
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CornerDownLeft, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Clock, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { loanService } from '@/utils/sfdLoanApi';
import { LoanPaymentHistory } from '@/components/loans/LoanPaymentHistory';
import { LoanDocuments } from '@/components/loans/LoanDocuments';
import { useSfdClients } from '@/hooks/useSfdClients';

const LoanDetailsPage = () => {
  const navigate = useNavigate();
  const { loanId } = useParams<{ loanId: string }>();
  const { activeSfdId } = useSfdClients();
  
  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => loanService.fetchLoanById(loanId || ''),
    enabled: !!loanId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SfdHeader />
        <div className="container mx-auto py-8 px-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SfdHeader />
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 mx-auto text-red-500 mb-2" />
              <h2 className="text-xl font-semibold mb-2">Prêt non trouvé</h2>
              <p className="text-muted-foreground mb-4">
                Les détails du prêt demandé ne sont pas disponibles.
              </p>
              <Button onClick={() => navigate('/loans')}>
                <CornerDownLeft className="mr-2 h-4 w-4" /> Retour aux prêts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approuvé</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actif</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">Complété</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      case 'defaulted':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Défaut</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/loans')}
            >
              <CornerDownLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Détails du Prêt</h1>
            {getStatusBadge(loan.status)}
          </div>
          
          <div className="flex gap-2">
            {loan.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
              </>
            )}
            {loan.status === 'approved' && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <CreditCard className="mr-2 h-4 w-4" />
                Décaisser
              </Button>
            )}
            {loan.status === 'active' && (
              <Button>
                <DollarSign className="mr-2 h-4 w-4" />
                Enregistrer Paiement
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations sur le prêt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Montant</p>
                    <p className="text-lg font-semibold">{loan.amount?.toLocaleString()} FCFA</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Mensualité</p>
                    <p className="text-lg font-semibold">{loan.monthly_payment?.toLocaleString()} FCFA</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Durée</p>
                    <p className="text-lg font-semibold">{loan.duration_months} mois</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Taux d'intérêt</p>
                    <p className="text-lg font-semibold">{loan.interest_rate}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="text-lg font-semibold">
                      {new Date(loan.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Prochaine échéance</p>
                    <p className="text-lg font-semibold">
                      {loan.next_payment_date 
                        ? new Date(loan.next_payment_date).toLocaleDateString('fr-FR')
                        : 'Non applicable'}
                    </p>
                  </div>
                  <div className="col-span-2 space-y-1 pt-2">
                    <p className="text-sm text-muted-foreground">Objet du prêt</p>
                    <p className="text-base">{loan.purpose}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="payments">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Paiements
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Historique
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="payments">
                <Card>
                  <CardContent className="p-6">
                    <LoanPaymentHistory loanId={loanId || ''} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents">
                <Card>
                  <CardContent className="p-6">
                    <LoanDocuments loanId={loanId || ''} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-10">
                      <Clock className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <p>Historique des activités à implémenter</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{loan.client_name || 'Client'}</h3>
                    <p className="text-sm text-muted-foreground">Client ID: {loan.client_id?.substring(0, 8)}</p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={() => navigate(`/client/${loan.client_id}`)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Voir le profil client
                </Button>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Autres prêts</h4>
                  <p className="text-sm text-muted-foreground">
                    Aucun autre prêt actif pour ce client.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Générer une attestation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Reprogrammer paiement
                </Button>
                <Button variant="outline" className="w-full justify-start text-amber-600">
                  <Clock className="mr-2 h-4 w-4" />
                  Envoyer rappel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsPage;
