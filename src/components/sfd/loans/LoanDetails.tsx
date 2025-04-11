
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loan } from '@/types/sfdClients';
import { 
  Calendar, Check, X, CreditCard, FileText, History, 
  ArrowUp, ArrowDown, Clock, Banknote, BarChart4, Info
} from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';

interface LoanDetailsProps {
  loan: Loan;
  onClose: () => void;
  onApproveLoan: (loanId: string) => void;
  onRejectLoan: (loanId: string) => void;
  onDisburseLoan: (loanId: string) => void;
  recordPayment: UseMutationResult<any, Error, any, unknown>;
}

export default function LoanDetails({ 
  loan, 
  onClose, 
  onApproveLoan, 
  onRejectLoan, 
  onDisburseLoan,
  recordPayment 
}: LoanDetailsProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Formatter les dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Obtenir un badge de statut
  const getStatusBadge = () => {
    switch (loan.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approuvé</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actif</Badge>;
      case 'disbursed':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Décaissé</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Terminé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  // Calculer les montants
  const principal = loan.amount || 0;
  const interestRate = loan.interest_rate || 0;
  const totalInterest = principal * (interestRate / 100) * (loan.duration_months || 0) / 12;
  const totalAmount = principal + totalInterest;
  const subsidyAmount = loan.subsidy_amount || 0;
  const subsidyRate = subsidyAmount > 0 ? (subsidyAmount / principal) * 100 : 0;
  const netAmount = totalAmount - subsidyAmount;
  
  // Gérer le paiement
  const handleSubmitPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    
    recordPayment.mutate({
      loanId: loan.id,
      amount: parseFloat(paymentAmount),
      paymentMethod: paymentMethod
    });
    
    // Réinitialiser le formulaire
    setPaymentAmount('');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Prêt #{loan.id.substring(0, 8)}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">{loan.purpose}</p>
        </div>
        
        <div className="flex gap-2">
          {loan.status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onRejectLoan(loan.id)}
              >
                <X className="h-4 w-4" />
                Rejeter
              </Button>
              <Button 
                variant="outline" 
                className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => onApproveLoan(loan.id)}
              >
                <Check className="h-4 w-4" />
                Approuver
              </Button>
            </>
          )}
          
          {loan.status === 'approved' && (
            <Button 
              variant="outline" 
              className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => onDisburseLoan(loan.id)}
            >
              <Banknote className="h-4 w-4" />
              Décaisser
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="details" className="flex items-center justify-center">
            <Info className="h-4 w-4 mr-2" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="repayments" className="flex items-center justify-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center justify-center">
            <History className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Détails du client</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Nom</dt>
                    <dd className="text-sm font-medium">{loan.client_name || `Client #${loan.client_id?.substring(0, 6)}`}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">ID Client</dt>
                    <dd className="text-sm font-medium">{loan.client_id}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Détails du prêt</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Date de création</dt>
                    <dd className="text-sm font-medium">{formatDate(loan.created_at)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Durée</dt>
                    <dd className="text-sm font-medium">{loan.duration_months} mois</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Taux d'intérêt</dt>
                    <dd className="text-sm font-medium">{loan.interest_rate}%</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Montants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">Principal</div>
                  <div className="text-lg font-semibold">{principal.toLocaleString('fr-FR')} FCFA</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">Intérêts totaux</div>
                  <div className="text-lg font-semibold">{totalInterest.toLocaleString('fr-FR')} FCFA</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">Mensualité</div>
                  <div className="text-lg font-semibold">{loan.monthly_payment?.toLocaleString('fr-FR')} FCFA</div>
                </div>
                
                {subsidyAmount > 0 && (
                  <>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground mb-1">Subvention</div>
                      <div className="text-lg font-semibold">{subsidyAmount.toLocaleString('fr-FR')} FCFA</div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground mb-1">Taux de subvention</div>
                      <div className="text-lg font-semibold">{subsidyRate.toFixed(2)}%</div>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-md">
                      <div className="text-sm text-muted-foreground mb-1">Montant net</div>
                      <div className="text-lg font-semibold">{netAmount.toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="repayments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enregistrer un paiement</CardTitle>
              <CardDescription>Ajoutez un paiement manuel pour ce prêt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment-amount">Montant</Label>
                  <Input 
                    id="payment-amount" 
                    type="number" 
                    placeholder="Montant en FCFA"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="payment-method">Méthode de paiement</Label>
                  <select 
                    id="payment-method"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Espèces</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Virement bancaire</option>
                    <option value="check">Chèque</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleSubmitPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || recordPayment.isPending}
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                >
                  {recordPayment.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    'Enregistrer le paiement'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique des paiements</CardTitle>
              <CardDescription>Liste de tous les paiements effectués pour ce prêt</CardDescription>
            </CardHeader>
            <CardContent>
              {loan.payments && loan.payments.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {loan.payments.map((payment, index) => (
                    <div key={index} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{payment.amount.toLocaleString('fr-FR')} FCFA</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(payment.created_at)} - {payment.payment_method}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={payment.status === 'completed' 
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {payment.status === 'completed' ? 'Complété' : 'En traitement'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed rounded-md">
                  <p className="text-muted-foreground">Aucun paiement enregistré pour ce prêt</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique du prêt</CardTitle>
              <CardDescription>Toutes les actions effectuées sur ce prêt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative pl-6 pb-4 border-l border-muted">
                  <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm font-medium">Prêt créé</div>
                  <div className="text-xs text-muted-foreground">{formatDate(loan.created_at)}</div>
                  <div className="text-sm mt-1">Montant : {principal.toLocaleString('fr-FR')} FCFA</div>
                </div>
                
                {loan.status !== 'pending' && loan.approved_at && (
                  <div className="relative pl-6 pb-4 border-l border-muted">
                    <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="text-sm font-medium">Prêt approuvé</div>
                    <div className="text-xs text-muted-foreground">{formatDate(loan.approved_at)}</div>
                    <div className="text-sm mt-1">Par : {loan.approved_by ? loan.approved_by.substring(0, 8) : 'Système'}</div>
                  </div>
                )}
                
                {loan.status === 'disbursed' && loan.disbursed_at && (
                  <div className="relative pl-6 pb-4 border-l border-muted">
                    <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>
                    <div className="text-sm font-medium">Prêt décaissé</div>
                    <div className="text-xs text-muted-foreground">{formatDate(loan.disbursed_at)}</div>
                    <div className="text-sm mt-1">Montant décaissé : {(principal - subsidyAmount).toLocaleString('fr-FR')} FCFA</div>
                  </div>
                )}
                
                {loan.status === 'rejected' && (
                  <div className="relative pl-6 pb-4 border-l border-muted">
                    <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="text-sm font-medium">Prêt rejeté</div>
                    <div className="text-xs text-muted-foreground">Date non disponible</div>
                  </div>
                )}
                
                {loan.status === 'completed' && (
                  <div className="relative pl-6 pb-4 border-l border-muted">
                    <div className="absolute top-0 left-0 w-6 h-6 flex items-center justify-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="text-sm font-medium">Prêt remboursé</div>
                    <div className="text-xs text-muted-foreground">Date non disponible</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <div className="flex justify-end">
        <Button onClick={onClose}>Fermer</Button>
      </div>
    </div>
  );
}
