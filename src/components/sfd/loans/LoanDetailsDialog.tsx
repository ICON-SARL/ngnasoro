
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  Clock, 
  CreditCard, 
  FileText, 
  User, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

interface LoanDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onLoanUpdated: () => void;
}

const LoanDetailsDialog: React.FC<LoanDetailsDialogProps> = ({ 
  isOpen, 
  onClose,
  loan,
  onLoanUpdated
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // For payments tab
  const [paymentAmount, setPaymentAmount] = useState(loan.monthly_payment ? loan.monthly_payment.toString() : '');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loanPayments, setLoanPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  
  React.useEffect(() => {
    if (isOpen && loan) {
      fetchLoanPayments();
    }
  }, [isOpen, loan]);

  const fetchLoanPayments = async () => {
    try {
      setLoadingPayments(true);
      const { data, error } = await supabase
        .from('loan_payments')
        .select('*')
        .eq('loan_id', loan.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setLoanPayments(data || []);
    } catch (error) {
      console.error('Error fetching loan payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const approveLoan = async () => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', loan.id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Prêt approuvé",
        description: "Le prêt a été approuvé avec succès."
      });
      
      onLoanUpdated();
      onClose();
    } catch (error) {
      console.error('Error approving loan:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le prêt",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const rejectLoan = async () => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({ 
          status: 'rejected', 
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', loan.id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Prêt rejeté",
        description: "Le prêt a été rejeté."
      });
      
      onLoanUpdated();
      onClose();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le prêt",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const disburseLoan = async () => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase
        .from('sfd_loans')
        .update({ 
          status: 'active',
          disbursed_at: new Date().toISOString(),
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
        })
        .eq('id', loan.id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Prêt décaissé",
        description: "Le prêt a été décaissé avec succès."
      });
      
      onLoanUpdated();
      onClose();
    } catch (error) {
      console.error('Error disbursing loan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de décaisser le prêt",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const recordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create payment record
      const { data, error } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: loan.id,
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          payment_date: new Date().toISOString(),
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update loan's next payment date (add 30 days to current date)
      const currentDate = new Date();
      const nextPaymentDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const { error: updateError } = await supabase
        .from('sfd_loans')
        .update({
          last_payment_date: currentDate.toISOString(),
          next_payment_date: nextPaymentDate.toISOString()
        })
        .eq('id', loan.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été enregistré avec succès."
      });
      
      setPaymentAmount(loan.monthly_payment ? loan.monthly_payment.toString() : '');
      fetchLoanPayments();
      onLoanUpdated();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendReminder = async () => {
    try {
      setIsProcessing(true);
      
      // In a real application, this would trigger an email/SMS to the client
      toast({
        title: "Rappel envoyé",
        description: "Un rappel de paiement a été envoyé au client."
      });
      
      // Log the activity
      await supabase.from('loan_activities').insert({
        loan_id: loan.id,
        activity_type: 'payment_reminder',
        description: 'Rappel de paiement envoyé manuellement',
        performed_by: user?.id
      });
      
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le rappel",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Détails du Prêt</DialogTitle>
          <DialogDescription>
            ID: {loan.reference || loan.id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <User className="mr-2 h-5 w-5" />
                    Informations Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Client:</strong> {loan.client_name || `Client #${loan.client_id.substring(0, 6)}`}</p>
                  {/* Additional client info would go here if available */}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Informations Prêt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Montant:</strong> {loan.amount.toLocaleString()} FCFA</p>
                  <p><strong>Taux:</strong> {loan.interest_rate}%</p>
                  <p><strong>Durée:</strong> {loan.duration_months} mois</p>
                  <p><strong>Mensualité:</strong> {loan.monthly_payment?.toLocaleString() || 'Non défini'} FCFA</p>
                  <p><strong>Objet:</strong> {loan.purpose}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Clock className="mr-2 h-5 w-5" />
                  Statut
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Statut actuel:</span>
                  <Badge className={`
                    ${loan.status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
                    ${loan.status === 'approved' ? 'bg-blue-100 text-blue-800' : ''}
                    ${loan.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    ${loan.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                    ${loan.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
                    ${loan.status === 'defaulted' ? 'bg-red-200 text-red-900' : ''}
                  `}>
                    {loan.status === 'pending' && 'En attente'}
                    {loan.status === 'approved' && 'Approuvé'}
                    {loan.status === 'active' && 'Actif'}
                    {loan.status === 'rejected' && 'Rejeté'}
                    {loan.status === 'completed' && 'Terminé'}
                    {loan.status === 'defaulted' && 'En défaut'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Créé le:</p>
                    <p>{new Date(loan.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  {loan.approved_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Approuvé le:</p>
                      <p>{new Date(loan.approved_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {loan.disbursed_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Décaissé le:</p>
                      <p>{new Date(loan.disbursed_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {loan.next_payment_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Prochain paiement:</p>
                      <p>{new Date(loan.next_payment_date).toLocaleDateString()}</p>
                      <p className="text-xs">
                        {formatDistanceToNow(new Date(loan.next_payment_date), { 
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Enregistrer un paiement</CardTitle>
                <CardDescription>
                  Entrez les détails du paiement à enregistrer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Montant (FCFA)</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Montant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Méthode de paiement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="check">Chèque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={sendReminder}
                  disabled={isProcessing || loan.status !== 'active'}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Envoyer rappel
                </Button>
                <Button 
                  onClick={recordPayment}
                  disabled={isProcessing || !paymentAmount || loan.status !== 'active'}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Enregistrer paiement
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Historique des paiements</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPayments ? (
                  <div className="text-center py-4">Chargement des paiements...</div>
                ) : loanPayments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Aucun paiement enregistré pour ce prêt
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Montant</th>
                          <th className="text-left p-2">Méthode</th>
                          <th className="text-left p-2">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {loanPayments.map(payment => (
                          <tr key={payment.id}>
                            <td className="p-2">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </td>
                            <td className="p-2">{payment.amount.toLocaleString()} FCFA</td>
                            <td className="p-2">
                              {payment.payment_method === 'cash' && 'Espèces'}
                              {payment.payment_method === 'bank_transfer' && 'Virement bancaire'}
                              {payment.payment_method === 'mobile_money' && 'Mobile Money'}
                              {payment.payment_method === 'check' && 'Chèque'}
                            </td>
                            <td className="p-2">
                              <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                                {payment.status === 'completed' ? 'Complété' : payment.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions disponibles</CardTitle>
                <CardDescription>
                  Actions que vous pouvez effectuer sur ce prêt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loan.status === 'pending' && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Approbation du prêt</h3>
                    <p className="text-sm text-muted-foreground">
                      Approuver ou rejeter cette demande de prêt
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={approveLoan}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approuver
                      </Button>
                      <Button 
                        onClick={rejectLoan}
                        disabled={isProcessing}
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                )}
                
                {loan.status === 'approved' && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Décaissement du prêt</h3>
                    <p className="text-sm text-muted-foreground">
                      Procéder au décaissement du montant approuvé
                    </p>
                    <Button 
                      onClick={disburseLoan}
                      disabled={isProcessing}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Décaisser le prêt
                    </Button>
                  </div>
                )}
                
                {loan.status === 'active' && (
                  <>
                    <div className="space-y-2">
                      <h3 className="font-medium">Gestion des paiements</h3>
                      <p className="text-sm text-muted-foreground">
                        Enregistrer les paiements et envoyer des rappels
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => setActiveTab('payments')}
                          variant="outline"
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Gérer les paiements
                        </Button>
                        <Button 
                          onClick={sendReminder}
                          disabled={isProcessing}
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Envoyer un rappel
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Actions administratives</h3>
                      <p className="text-sm text-muted-foreground">
                        Actions supplémentaires pour ce prêt
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" disabled>
                          <FileText className="mr-2 h-4 w-4" />
                          Générer tableau d'amortissement
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                
                {(loan.status === 'rejected' || loan.status === 'completed') && (
                  <div className="py-4 text-center text-muted-foreground">
                    Aucune action disponible pour les prêts {loan.status === 'rejected' ? 'rejetés' : 'terminés'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDetailsDialog;
