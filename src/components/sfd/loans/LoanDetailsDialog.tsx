
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loan } from '@/types/sfdClients';
import { sfdLoanApi } from '@/utils/sfdLoanApi';
import { sfdClientApi } from '@/utils/sfdClientApi';
import { useAuth } from '@/hooks/auth/AuthContext';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Ban, ArrowRight, Calendar, CreditCard, Phone, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LoanDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onLoanUpdated: () => void;
}

const LoanDetailsDialog = ({ isOpen, onClose, loan, onLoanUpdated }: LoanDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen && loan) {
      fetchClientInfo();
      if (loan.monthly_payment) {
        setPaymentAmount(loan.monthly_payment.toString());
      }
    }
  }, [isOpen, loan]);
  
  const fetchClientInfo = async () => {
    try {
      const clientData = await sfdClientApi.getClientById(loan.client_id);
      if (clientData) {
        setClientInfo(clientData);
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
    }
  };
  
  const handleApproveLoan = async () => {
    try {
      setLoading(true);
      await sfdLoanApi.approveLoan(loan.id, user!.id);
      toast({
        title: 'Prêt approuvé',
        description: 'Le prêt a été approuvé avec succès',
      });
      onLoanUpdated();
      onClose();
    } catch (error) {
      console.error('Error approving loan:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors de l'approbation du prêt",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectLoan = async () => {
    try {
      setLoading(true);
      // Ajouter une raison de rejet (3ème argument)
      await sfdLoanApi.rejectLoan(loan.id, user!.id, "Demande rejetée par l'administrateur");
      toast({
        title: 'Prêt rejeté',
        description: 'Le prêt a été rejeté',
      });
      onLoanUpdated();
      onClose();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors du rejet du prêt",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisburseLoan = async () => {
    try {
      setLoading(true);
      await sfdLoanApi.disburseLoan(loan.id, user!.id);
      toast({
        title: 'Prêt décaissé',
        description: 'Le prêt a été décaissé avec succès',
      });
      onLoanUpdated();
      onClose();
    } catch (error) {
      console.error('Error disbursing loan:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors du décaissement du prêt",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un montant valide',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      await sfdLoanApi.recordLoanPayment(
        loan.id,
        parseFloat(paymentAmount),
        'cash',
        user!.id
      );
      toast({
        title: 'Paiement enregistré',
        description: 'Le paiement a été enregistré avec succès',
      });
      onLoanUpdated();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors de l'enregistrement du paiement",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendReminder = async () => {
    try {
      setLoading(true);
      await sfdLoanApi.sendPaymentReminder(loan.id);
      toast({
        title: 'Rappel envoyé',
        description: 'Le rappel de paiement a été envoyé au client',
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors de l'envoi du rappel",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Détails du prêt</span>
            <Badge 
              className={
                loan.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                loan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                loan.status === 'active' ? 'bg-green-100 text-green-800' :
                loan.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-red-200 text-red-900'
              }
            >
              {loan.status === 'pending' ? 'En attente' :
               loan.status === 'approved' ? 'Approuvé' :
               loan.status === 'active' ? 'Actif' :
               loan.status === 'completed' ? 'Terminé' :
               loan.status === 'rejected' ? 'Rejeté' :
               'En défaut'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Montant</Label>
                <p className="font-semibold">{loan.amount.toLocaleString()} FCFA</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Durée</Label>
                <p className="font-semibold">{loan.duration_months} mois</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Taux d'intérêt</Label>
                <p className="font-semibold">{loan.interest_rate}%</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Mensualité</Label>
                <p className="font-semibold">{loan.monthly_payment?.toLocaleString()} FCFA</p>
              </div>
              
              <div className="col-span-2">
                <Label className="text-sm text-muted-foreground">Objet du prêt</Label>
                <p className="font-semibold">{loan.purpose}</p>
              </div>
            </div>
            
            {loan.subsidy_amount > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Subvention</h4>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm">Ce prêt bénéficie d'une subvention de <span className="font-semibold">{loan.subsidy_amount.toLocaleString()} FCFA</span></p>
                </div>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Actions</h4>
              
              <div className="flex flex-wrap gap-2">
                {loan.status === 'pending' && (
                  <>
                    <Button 
                      onClick={handleApproveLoan} 
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button 
                      onClick={handleRejectLoan} 
                      variant="destructive" 
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </>
                )}
                
                {loan.status === 'approved' && (
                  <Button 
                    onClick={handleDisburseLoan} 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Décaisser les fonds
                  </Button>
                )}
                
                {loan.status === 'active' && (
                  <Button 
                    onClick={handleSendReminder} 
                    variant="outline" 
                    disabled={loading}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Envoyer un rappel
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="client" className="space-y-4 pt-4">
            {clientInfo ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Nom complet</Label>
                    <p className="font-semibold">{clientInfo.full_name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-semibold">{clientInfo.email || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Téléphone</Label>
                    <p className="font-semibold">{clientInfo.phone || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Adresse</Label>
                    <p className="font-semibold">{clientInfo.address || 'Non renseignée'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Type d'ID</Label>
                    <p className="font-semibold">{clientInfo.id_type || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Numéro d'ID</Label>
                    <p className="font-semibold">{clientInfo.id_number || 'Non renseigné'}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-end">
                  <Button variant="outline">
                    Voir profil complet
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-muted-foreground">Informations client non disponibles</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="payments" className="space-y-4 pt-4">
            {loan.status === 'active' && (
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="payment-amount">Montant du paiement (FCFA)</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Entrez le montant"
                    />
                  </div>
                  <Button onClick={handleRecordPayment} disabled={loading}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
                
                {loan.next_payment_date && (
                  <div className="bg-amber-50 p-3 rounded-md flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <p className="text-sm text-amber-800">
                      Prochaine échéance: {format(new Date(loan.next_payment_date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <h4 className="text-sm font-medium">Historique des paiements</h4>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium">Montant</th>
                    <th className="px-4 py-2 text-left text-xs font-medium">Méthode</th>
                    <th className="px-4 py-2 text-left text-xs font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm" colSpan={4}>
                      <p className="text-center text-muted-foreground">Aucun paiement enregistré</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDetailsDialog;
