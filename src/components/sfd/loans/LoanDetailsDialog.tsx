
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  CreditCard, 
  Calendar,
  User,
  FileText,
  Banknote,
  Percent,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/AuthContext';
import { sfdLoanApi } from '@/utils/sfdLoanApi';
import { Loan } from './LoanWorkflow';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState<string | null>(null);
  
  const handleApproveLoan = async () => {
    try {
      setLoading('approve');
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }
      
      await sfdLoanApi.approveLoan(loan.id, user.id);
      
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
        description: 'Impossible d\'approuver le prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };
  
  const handleRejectLoan = async () => {
    try {
      setLoading('reject');
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }
      
      await sfdLoanApi.rejectLoan(loan.id, user.id);
      
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
        description: 'Impossible de rejeter le prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };
  
  const handleDisburseLoan = async () => {
    try {
      setLoading('disburse');
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }
      
      await sfdLoanApi.disburseLoan(loan.id, user.id);
      
      toast({
        title: 'Prêt décaissé',
        description: 'Le prêt a été décaissé et les fonds transférés au client',
      });
      
      onLoanUpdated();
      onClose();
    } catch (error) {
      console.error('Error disbursing loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de décaisser le prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const renderActionButtons = () => {
    if (loan.status === 'pending') {
      return (
        <>
          <Button 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-50" 
            onClick={handleRejectLoan}
            disabled={loading !== null}
          >
            <X className="h-4 w-4 mr-2" />
            {loading === 'reject' ? 'En cours...' : 'Rejeter'}
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleApproveLoan}
            disabled={loading !== null}
          >
            <Check className="h-4 w-4 mr-2" />
            {loading === 'approve' ? 'En cours...' : 'Approuver'}
          </Button>
        </>
      );
    }
    
    if (loan.status === 'approved') {
      return (
        <Button 
          onClick={handleDisburseLoan}
          disabled={loading !== null}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {loading === 'disburse' ? 'En cours...' : 'Décaisser le prêt'}
        </Button>
      );
    }
    
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Détails du prêt</span>
            {loan.status === 'pending' && (
              <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
            )}
            {loan.status === 'approved' && (
              <Badge className="bg-blue-100 text-blue-800">Approuvé</Badge>
            )}
            {loan.status === 'active' && (
              <Badge className="bg-green-100 text-green-800">Actif</Badge>
            )}
            {loan.status === 'completed' && (
              <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>
            )}
            {loan.status === 'rejected' && (
              <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="timeline">Chronologie</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nom</span>
                    <span className="font-medium">{loan.client_name || 'Client #' + loan.client_id.substring(0, 6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ID Client</span>
                    <span>{loan.client_id.substring(0, 8)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Banknote className="h-5 w-5 mr-2" />
                    Prêt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ID Prêt</span>
                    <span>{loan.reference || loan.id.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date de création</span>
                    <span>{formatDate(loan.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Détails financiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Montant</span>
                    <span className="font-medium">{loan.amount.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Durée</span>
                    <span>{loan.duration_months} mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taux d'intérêt</span>
                    <span className="flex items-center">
                      <Percent className="h-3 w-3 mr-1" />
                      {loan.interest_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Objet du prêt</span>
                    <span>{loan.purpose}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Échéancier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mensualité estimée</span>
                    <span className="font-medium">
                      {(() => {
                        // Calculate monthly payment
                        const principal = loan.amount;
                        const rate = loan.interest_rate / 100 / 12;
                        const duration = loan.duration_months;
                        const payment = (principal * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1);
                        return isNaN(payment) ? 'N/A' : Math.round(payment).toLocaleString() + ' FCFA';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Premier paiement</span>
                    <span>
                      {loan.status === 'active' ? formatDate(
                        (() => {
                          const date = new Date();
                          date.setDate(date.getDate() + 30);
                          return date.toISOString();
                        })()
                      ) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dernier paiement</span>
                    <span>
                      {loan.status === 'active' ? formatDate(
                        (() => {
                          const date = new Date();
                          date.setMonth(date.getMonth() + loan.duration_months);
                          return date.toISOString();
                        })()
                      ) : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline">
            <div className="space-y-4">
              <div className="border-l-2 border-gray-200 pl-4 ml-4 relative">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px]"></div>
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground">{formatDate(loan.created_at)}</div>
                  <div className="font-medium">Demande de prêt créée</div>
                  <div className="text-sm">Montant: {loan.amount.toLocaleString()} FCFA</div>
                </div>
                
                {loan.status !== 'pending' && (
                  <>
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-20"></div>
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground">
                        {loan.status === 'rejected' ? formatDate(loan.created_at) : formatDate(
                          (() => {
                            const date = new Date(loan.created_at);
                            date.setDate(date.getDate() + 2);
                            return date.toISOString();
                          })()
                        )}
                      </div>
                      <div className="font-medium">
                        {loan.status === 'rejected' 
                          ? 'Prêt rejeté' 
                          : 'Prêt approuvé'}
                      </div>
                      {loan.status !== 'rejected' && (
                        <div className="text-sm">Prêt approuvé par l'agent SFD</div>
                      )}
                    </div>
                  </>
                )}
                
                {(loan.status === 'active' || loan.status === 'completed') && (
                  <>
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-40"></div>
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(
                          (() => {
                            const date = new Date(loan.created_at);
                            date.setDate(date.getDate() + 3);
                            return date.toISOString();
                          })()
                        )}
                      </div>
                      <div className="font-medium">Prêt décaissé</div>
                      <div className="text-sm">Fonds transférés sur le compte du client</div>
                    </div>
                  </>
                )}
                
                {loan.status === 'completed' && (
                  <>
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-60"></div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(
                          (() => {
                            const date = new Date(loan.created_at);
                            date.setMonth(date.getMonth() + loan.duration_months);
                            return date.toISOString();
                          })()
                        )}
                      </div>
                      <div className="font-medium">Prêt remboursé</div>
                      <div className="text-sm">Tous les paiements ont été effectués</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="payments">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Historique des paiements
                  </CardTitle>
                  <CardDescription>
                    {loan.status === 'pending' || loan.status === 'approved' 
                      ? 'Aucun paiement n\'a encore été effectué pour ce prêt'
                      : 'Historique des remboursements du prêt'
                    }
                  </CardDescription>
                </CardHeader>
                {loan.status === 'active' || loan.status === 'completed' ? (
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Montant</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Méthode</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {/* Example payment data for demonstration */}
                          <tr>
                            <td className="px-4 py-3 text-sm">
                              {formatDate(
                                (() => {
                                  const date = new Date(loan.created_at);
                                  date.setMonth(date.getMonth() + 1);
                                  return date.toISOString();
                                })()
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {Math.round(loan.amount / loan.duration_months).toLocaleString()} FCFA
                            </td>
                            <td className="px-4 py-3 text-sm">Mobile Money</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge className="bg-green-100 text-green-800">Complété</Badge>
                            </td>
                          </tr>
                          {loan.status === 'completed' && (
                            <>
                              <tr>
                                <td className="px-4 py-3 text-sm">
                                  {formatDate(
                                    (() => {
                                      const date = new Date(loan.created_at);
                                      date.setMonth(date.getMonth() + 2);
                                      return date.toISOString();
                                    })()
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {Math.round(loan.amount / loan.duration_months).toLocaleString()} FCFA
                                </td>
                                <td className="px-4 py-3 text-sm">Virement bancaire</td>
                                <td className="px-4 py-3 text-sm">
                                  <Badge className="bg-green-100 text-green-800">Complété</Badge>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 text-sm">
                                  {formatDate(
                                    (() => {
                                      const date = new Date(loan.created_at);
                                      date.setMonth(date.getMonth() + 3);
                                      return date.toISOString();
                                    })()
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {Math.round(loan.amount / loan.duration_months).toLocaleString()} FCFA
                                </td>
                                <td className="px-4 py-3 text-sm">Dépôt en espèces</td>
                                <td className="px-4 py-3 text-sm">
                                  <Badge className="bg-green-100 text-green-800">Complété</Badge>
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      Les paiements seront affichés ici une fois le prêt activé
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            ID: {loan.id}
          </p>
          <div className="flex gap-2">
            {renderActionButtons()}
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading !== null}
            >
              Fermer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDetailsDialog;
