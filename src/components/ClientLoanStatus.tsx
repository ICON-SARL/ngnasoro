import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loan } from '@/types/sfdClients';
import { useClientLoans } from '@/hooks/useClientLoans';
import { Clock, CheckCircle, XCircle, AlertTriangle, FileText, CalendarIcon, BanknoteIcon, InfoIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const LoanStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">En attente</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Approuvé</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejeté</Badge>;
    case 'active':
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Actif</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Terminé</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const LoanStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-amber-500" />;
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'active':
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-gray-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  }
};

const LoanCard = ({ loan }: { loan: Loan }) => {
  const createdDate = new Date(loan.created_at);
  const formattedDate = formatDistanceToNow(createdDate, { addSuffix: true, locale: fr });
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <LoanStatusIcon status={loan.status} />
            </div>
            <div>
              <h3 className="font-semibold">{loan.purpose}</h3>
              <p className="text-sm text-muted-foreground">Demande {formattedDate}</p>
            </div>
          </div>
          <LoanStatusBadge status={loan.status} />
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="font-medium">{loan.amount.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Durée</p>
              <p className="font-medium">{loan.duration_months} mois</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Mensualité</p>
              <p className="font-medium">{loan.monthly_payment.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Taux d'intérêt</p>
              <p className="font-medium">{(loan.interest_rate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm">Voir les détails</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ClientLoanStatus = () => {
  const { loans, isLoading } = useClientLoans();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const filteredLoans = loans.filter(loan => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return loan.status === 'pending';
    if (activeTab === 'approved') return loan.status === 'approved' || loan.status === 'active';
    if (activeTab === 'rejected') return loan.status === 'rejected';
    return true;
  });
  
  const pendingCount = loans.filter(loan => loan.status === 'pending').length;
  const approvedCount = loans.filter(loan => loan.status === 'approved' || loan.status === 'active').length;
  const rejectedCount = loans.filter(loan => loan.status === 'rejected').length;
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes demandes de prêt</CardTitle>
        <CardDescription>
          Suivez l'état de vos demandes de prêt et leur traitement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all">
              Tous ({loans.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              En attente ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approuvés ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejetés ({rejectedCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {loans.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune demande de prêt</h3>
                <p className="text-muted-foreground mb-6">
                  Vous n'avez pas encore de demande de prêt. Commencez par en créer une.
                </p>
                <Button asChild>
                  <Link to="/loans/apply">Faire une demande de prêt</Link>
                </Button>
              </div>
            ) : (
              <div>
                {filteredLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            {filteredLoans.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune demande en attente</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas de demande en cours d'examen.
                </p>
              </div>
            ) : (
              <div>
                {filteredLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-0">
            {filteredLoans.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun prêt approuvé</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore de prêt approuvé ou actif.
                </p>
              </div>
            ) : (
              <div>
                {filteredLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0">
            {filteredLoans.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune demande rejetée</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas de demande rejetée.
                </p>
              </div>
            ) : (
              <div>
                {filteredLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClientLoanStatus;
