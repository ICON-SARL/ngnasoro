
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loan } from '@/types/sfdClients';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { formatDateToLocale } from '@/utils/dateUtils';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { 
  AlertCircle, CheckCircle, CreditCard, DownloadIcon, 
  FileText, HistoryIcon, Send, User, XCircle, Calendar,
  Banknote, Clock, ArrowDown, ArrowUp, FileBarChart
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoanDetailsProps {
  loan: Loan;
  onClose: () => void;
  onAction?: () => void;
}

interface LoanPayment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
}

interface LoanActivity {
  id: string;
  activity_type: string;
  description: string;
  performed_at: string;
  performed_by: string;
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'approved':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'active':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'disbursed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'completed':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const LoanDetails: React.FC<LoanDetailsProps> = ({ loan, onClose, onAction }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [activities, setActivities] = useState<LoanActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    approveLoan,
    rejectLoan,
    disburseLoan,
    getLoanPayments,
    sendPaymentReminder
  } = useSfdLoans();

  useEffect(() => {
    fetchLoanDetails();
  }, [loan.id]);

  const fetchLoanDetails = async () => {
    setIsLoading(true);
    try {
      // In a real app, these would be actual API calls
      // For demo purposes, we'll create mock data
      
      // Get payments
      const paymentData = await getLoanPayments(loan.id);
      
      if (!paymentData || paymentData.length === 0) {
        // Create mock payment data if none exist
        const mockPayments = [];
        if (loan.status === 'active' || loan.status === 'completed') {
          const numberOfPayments = Math.min(
            loan.duration_months || 12, 
            loan.status === 'completed' ? (loan.duration_months || 12) : 3
          );
          
          for (let i = 1; i <= numberOfPayments; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (numberOfPayments - i));
            
            mockPayments.push({
              id: `pmt-${loan.id}-${i}`,
              amount: loan.monthly_payment || 0,
              payment_date: date.toISOString(),
              payment_method: ['cash', 'mobile_money', 'bank_transfer'][Math.floor(Math.random() * 3)],
              status: 'completed'
            });
          }
        }
        setPayments(mockPayments);
      } else {
        setPayments(paymentData as LoanPayment[]);
      }
      
      // Create mock activities
      const mockActivities = [
        {
          id: `act-${loan.id}-1`,
          activity_type: 'loan_created',
          description: `Prêt créé pour ${loan.client_name || 'le client'}`,
          performed_at: loan.created_at || new Date().toISOString(),
          performed_by: 'Agent SFD'
        }
      ];
      
      if (loan.status === 'approved' || loan.status === 'active' || loan.status === 'completed') {
        mockActivities.push({
          id: `act-${loan.id}-2`,
          activity_type: 'loan_approved',
          description: 'Prêt approuvé par le comité',
          performed_at: loan.approved_at || new Date().toISOString(),
          performed_by: loan.approved_by || 'Agent SFD'
        });
      }
      
      if (loan.status === 'active' || loan.status === 'completed') {
        const disbursementDate = new Date(loan.approved_at || loan.created_at || '');
        disbursementDate.setDate(disbursementDate.getDate() + 2);
        
        mockActivities.push({
          id: `act-${loan.id}-3`,
          activity_type: 'loan_disbursed',
          description: `Prêt décaissé de ${new Intl.NumberFormat('fr-FR').format(loan.amount)} FCFA`,
          performed_at: disbursementDate.toISOString(),
          performed_by: 'Agent SFD'
        });
      }
      
      if (loan.status === 'rejected') {
        mockActivities.push({
          id: `act-${loan.id}-4`,
          activity_type: 'loan_rejected',
          description: 'Prêt rejeté: documentation insuffisante',
          performed_at: new Date().toISOString(),
          performed_by: 'Agent SFD'
        });
      }
      
      // Add payment activities
      payments.forEach((payment, index) => {
        mockActivities.push({
          id: `act-${loan.id}-pmt-${index}`,
          activity_type: 'payment_recorded',
          description: `Paiement de ${new Intl.NumberFormat('fr-FR').format(payment.amount)} FCFA enregistré`,
          performed_at: payment.payment_date,
          performed_by: 'Agent SFD'
        });
      });
      
      // Sort activities by date, newest first
      mockActivities.sort((a, b) => 
        new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
      );
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveLoan = async () => {
    try {
      await approveLoan.mutateAsync({ loanId: loan.id });
      if (onAction) onAction();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleRejectLoan = async () => {
    try {
      await rejectLoan.mutateAsync({ loanId: loan.id });
      if (onAction) onAction();
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  const handleDisburseLoan = async () => {
    try {
      await disburseLoan.mutateAsync({ loanId: loan.id });
      if (onAction) onAction();
    } catch (error) {
      console.error('Error disbursing loan:', error);
    }
  };

  const handleSendReminder = async () => {
    try {
      await sendPaymentReminder.mutateAsync({ loanId: loan.id });
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const calculateLoanProgress = () => {
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalLoanAmount = loan.amount || 0;
    const progress = (totalPayments / totalLoanAmount) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return <Banknote className="h-4 w-4 mr-2" />;
      case 'mobile_money':
        return <CreditCard className="h-4 w-4 mr-2" />;
      case 'bank_transfer':
        return <ArrowDown className="h-4 w-4 mr-2" />;
      case 'cheque':
        return <FileBarChart className="h-4 w-4 mr-2" />;
      default:
        return <CreditCard className="h-4 w-4 mr-2" />;
    }
  };

  const getActivityIcon = (activity: LoanActivity) => {
    switch (activity.activity_type) {
      case 'loan_created':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'loan_approved':
        return <CheckCircle className="h-4 w-4 mr-2 text-green-500" />;
      case 'loan_rejected':
        return <XCircle className="h-4 w-4 mr-2 text-red-500" />;
      case 'loan_disbursed':
        return <Banknote className="h-4 w-4 mr-2 text-blue-500" />;
      case 'payment_recorded':
        return <ArrowDown className="h-4 w-4 mr-2 text-green-500" />;
      case 'payment_reminder':
        return <Bell className="h-4 w-4 mr-2 text-amber-500" />;
      default:
        return <HistoryIcon className="h-4 w-4 mr-2" />;
    }
  };

  // Get contextual actions based on loan status
  const getLoanActions = () => {
    switch (loan.status) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <Button 
              onClick={handleApproveLoan} 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={approveLoan.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
            <Button 
              onClick={handleRejectLoan} 
              variant="destructive"
              disabled={rejectLoan.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </div>
        );
      case 'approved':
        return (
          <Button 
            onClick={handleDisburseLoan}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={disburseLoan.isPending}
          >
            <Banknote className="h-4 w-4 mr-2" />
            Décaisser le prêt
          </Button>
        );
      case 'active':
        return (
          <Button 
            onClick={handleSendReminder}
            variant="outline"
            disabled={sendPaymentReminder.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            Rappel de paiement
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Prêt #{loan.id?.substring(0, 8)}</h3>
            <Badge className={`${getStatusColor(loan.status)}`}>
              {loan.status === 'pending' ? 'En attente' :
               loan.status === 'approved' ? 'Approuvé' :
               loan.status === 'active' ? 'Actif' :
               loan.status === 'disbursed' ? 'Décaissé' :
               loan.status === 'completed' ? 'Terminé' :
               loan.status === 'rejected' ? 'Rejeté' : loan.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Créé le {formatDateToLocale(loan.created_at || '')}
          </p>
        </div>
        
        {getLoanActions()}
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {loan.client_name || `Client #${loan.client_id?.substring(0, 8)}`}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Objet: {loan.purpose || 'Non spécifié'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Détails du Prêt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-sm text-muted-foreground">Montant</div>
                  <div className="text-sm font-medium">{formatCurrency(loan.amount)}</div>
                  
                  <div className="text-sm text-muted-foreground">Taux d'intérêt</div>
                  <div className="text-sm font-medium">{loan.interest_rate}%</div>
                  
                  <div className="text-sm text-muted-foreground">Durée</div>
                  <div className="text-sm font-medium">{loan.duration_months} mois</div>
                  
                  <div className="text-sm text-muted-foreground">Mensualité</div>
                  <div className="text-sm font-medium">{formatCurrency(loan.monthly_payment)}</div>

                  {loan.subsidy_amount > 0 && (
                    <>
                      <div className="text-sm text-muted-foreground">Subvention</div>
                      <div className="text-sm font-medium">
                        {formatCurrency(loan.subsidy_amount)} 
                        {loan.subsidy_rate ? ` (${loan.subsidy_rate}%)` : ''}
                      </div>
                    </>
                  )}
                  
                  <div className="text-sm text-muted-foreground">Décaissé le</div>
                  <div className="text-sm font-medium">
                    {loan.disbursed_at ? formatDateToLocale(loan.disbursed_at) : 'Non décaissé'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progression du Prêt</CardTitle>
              <CardDescription>
                Aperçu des échéances et remboursements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loan.status === 'active' || loan.status === 'completed' ? (
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${calculateLoanProgress()}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remboursé: {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                    <span className="font-medium">Total: {formatCurrency(loan.amount)}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Dernier paiement</span>
                      <span className="font-medium">
                        {payments.length > 0 
                          ? formatDateToLocale(payments[0].payment_date) 
                          : 'Aucun paiement'}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Montant payé</span>
                      <span className="font-medium">{formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Prochain paiement</span>
                      <span className="font-medium">
                        {loan.next_payment_date 
                          ? formatDateToLocale(loan.next_payment_date) 
                          : '15/05/2025'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    {loan.status === 'pending' 
                      ? "Le prêt est en attente d'approbation. Aucun paiement n'est encore requis." 
                      : loan.status === 'approved' 
                      ? "Le prêt a été approuvé mais n'a pas encore été décaissé." 
                      : "Aucune information de paiement disponible pour ce prêt."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique des Paiements</CardTitle>
              <CardDescription>
                Suivi des remboursements effectués
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Chargement des paiements...</div>
              ) : payments.length === 0 ? (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    Aucun paiement n'a encore été effectué pour ce prêt.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <div>
                          <div className="font-medium">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDateToLocale(payment.payment_date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          {payment.payment_method === 'cash' 
                            ? 'Espèces' 
                            : payment.payment_method === 'mobile_money' 
                            ? 'Mobile Money' 
                            : payment.payment_method === 'bank_transfer'
                            ? 'Virement bancaire'
                            : payment.payment_method}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 justify-between flex">
              <span className="text-sm font-medium">
                Total remboursé: {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </span>
              <Button variant="outline" size="sm">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Journal d'Activités</CardTitle>
              <CardDescription>
                Historique des actions sur ce prêt
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Chargement des activités...</div>
              ) : activities.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Aucune activité enregistrée pour ce prêt.
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-4 ml-6">
                    {activities.map((activity) => (
                      <div key={activity.id} className="relative">
                        <div className="absolute -left-6 mt-1.5 w-3 h-3 rounded-full border-2 border-white bg-blue-500"></div>
                        <div className="flex flex-col mb-2">
                          <div className="flex items-center">
                            {getActivityIcon(activity)}
                            <span className="font-medium">{activity.description}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDateToLocale(activity.performed_at)}
                            <span className="mx-2">•</span>
                            <User className="h-3 w-3 mr-1" />
                            {activity.performed_by}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
};

export default LoanDetails;
