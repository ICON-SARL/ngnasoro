
import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, CreditCard, Calendar, Clock, MoreHorizontal, QrCode, Smartphone, Download, Building, Wallet, ActivitySquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { supabase } from '@/integrations/supabase/client';

interface LoanDetailsPageProps {
  onBack: () => void;
}

const LoanDetailsPage: React.FC<LoanDetailsPageProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrExpiry, setQrExpiry] = useState<Date | null>(null);
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  const [activeTab, setActiveTab] = useState('tracking');
  const [loanStatus, setLoanStatus] = useState({
    nextPaymentDue: '10 Juillet 2023',
    paidAmount: 10.40,
    totalAmount: 25.40,
    remainingAmount: 15.00,
    progress: 40,
    lateFees: 0,
    paymentHistory: [
      { id: 1, date: '05 August 2023', amount: 3.50, status: 'paid' },
      { id: 2, date: '05 July 2023', amount: 3.50, status: 'paid' },
      { id: 3, date: '05 June 2023', amount: 3.50, status: 'paid' }
    ],
    disbursed: true,
    withdrawn: false
  });
  const [countdown, setCountdown] = useState('');
  const { getActiveSfdData } = useSfdDataAccess();
  
  // Setup real-time subscription for loan status updates
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const channel = supabase
        .channel('loan-status-changes')
        .on(
          'broadcast',
          { event: 'loan_status_update' },
          (payload) => {
            if (payload.payload) {
              const updatedStatus = payload.payload;
              setLoanStatus(prevStatus => ({
                ...prevStatus,
                ...updatedStatus
              }));
              
              if (updatedStatus.lateFees > 0) {
                toast({
                  title: "Frais de retard appliqués",
                  description: `Des frais de retard de ${updatedStatus.lateFees} FCFA ont été appliqués à votre prêt`,
                  variant: "destructive",
                });
              }
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    setupRealtimeSubscription();
  }, [toast]);
  
  // Countdown timer for QR code expiry
  useEffect(() => {
    if (!qrExpiry) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = qrExpiry.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown('Expiré');
        setQrGenerated(false);
        clearInterval(interval);
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [qrExpiry]);

  const handleGenerateQrCode = () => {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15); // 15 minutes expiry
    
    setQrExpiry(expiryDate);
    setQrGenerated(true);
    
    toast({
      title: "QR Code généré",
      description: "Ce code est valable pendant 15 minutes. Présentez-le à l'agent SFD pour effectuer votre paiement.",
    });
  };

  const handleMobileMoneyWithdrawal = async () => {
    try {
      setMobileMoneyInitiated(true);
      
      // Simulating API call to MTN Mobile Money
      const activeSfd = await getActiveSfdData();
      
      if (!activeSfd) {
        throw new Error("Impossible de récupérer les données SFD");
      }
      
      toast({
        title: "Paiement Mobile Money initié",
        description: "Vérifiez votre téléphone pour confirmer le paiement",
      });
    } catch (error) {
      console.error('Mobile Money error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initialisation du paiement",
        variant: "destructive",
      });
    }
  };

  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="h-full bg-white">
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Détails du prêt</h1>
        <Button variant="outline" size="sm" className="flex items-center text-xs" onClick={viewLoanProcess}>
          <ActivitySquare className="h-3 w-3 mr-1" /> Processus
        </Button>
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold">Microfinance Bamako</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-gray-100 rounded-full p-1 mb-6">
            <TabsTrigger value="tracking" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Suivi
            </TabsTrigger>
            <TabsTrigger value="details" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Détails
            </TabsTrigger>
            <TabsTrigger value="repayment" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Remboursement
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracking" className="mt-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-gray-500">Payé à ce jour</p>
                <p className="text-xl font-bold">${loanStatus.paidAmount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Restant</p>
                <p className="text-xl font-bold">${loanStatus.remainingAmount}</p>
              </div>
            </div>
            
            <Progress value={loanStatus.progress} className="h-2 bg-gray-100" />
            
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="font-medium">{loanStatus.progress}% remboursé</span>
              <span className="text-gray-500">Prochain paiement: {loanStatus.nextPaymentDue}</span>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Clock className="h-5 w-5 mr-2" /> Historique des paiements
              </h3>
              
              {loanStatus.paymentHistory.map((payment, index) => (
                <div key={payment.id} className="mb-4 relative pl-6">
                  <div className={`absolute top-1.5 left-0 w-3 h-3 rounded-full ${index === 0 ? 'bg-teal-500' : index === 1 ? 'bg-purple-400' : 'bg-teal-300'}`}></div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Paiement automatique</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                    <p className="font-bold">${payment.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {loanStatus.lateFees > 0 && (
              <Alert variant="destructive" className="mt-4">
                <Bell className="h-4 w-4" />
                <AlertTitle>Paiement en retard</AlertTitle>
                <AlertDescription>
                  Des frais de retard de ${loanStatus.lateFees} ont été appliqués à votre prêt.
                </AlertDescription>
              </Alert>
            )}
            
            <Card className="bg-purple-100 border-0 rounded-xl mt-6">
              <CardContent className="p-4">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <img src="/lovable-uploads/ef525c3f-3c63-46c2-a852-9c93524d29df.png" alt="Processing" className="w-16 h-16" />
                  </div>
                  <div>
                    <h3 className="font-bold">Votre prêt est actif</h3>
                    <p className="text-sm mt-1">Prochain paiement le {loanStatus.nextPaymentDue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">Informations du prêt</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Montant</p>
                      <p className="font-bold">${loanStatus.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Durée</p>
                      <p className="font-bold">6 mois</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Taux d'intérêt</p>
                      <p className="font-bold">2.5%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mensualité</p>
                      <p className="font-bold">$3.50</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">Détails de l'achat</h3>
                  <p className="text-sm text-gray-500">Date d'achat</p>
                  <p className="font-bold mb-2">5 janvier 2023</p>
                  
                  <p className="text-sm text-gray-500">Boutique</p>
                  <p className="font-bold">Insting Store</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">Institution SFD</h3>
                  <div className="flex items-center mb-2">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <p className="font-bold">Microfinance Bamako</p>
                  </div>
                  <p className="text-sm text-gray-500">Numéro de compte</p>
                  <p className="font-bold">••••1234</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="repayment" className="mt-2 space-y-4">
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="font-bold">Prochain paiement</h3>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Date d'échéance</p>
                    <p className="font-bold">{loanStatus.nextPaymentDue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Montant dû</p>
                    <p className="font-bold text-lg">3,500 FCFA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Options de paiement</h3>
              
              <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
                <CardContent className="p-4" onClick={handleMobileMoneyWithdrawal}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                        <Smartphone className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Mobile Money</h4>
                        <p className="text-xs text-gray-500">Paiement via MTN Mobile Money</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-teal-500">
                      Choisir
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Paiement en agence SFD</h4>
                            <p className="text-xs text-gray-500">Générez un QR code à présenter en agence</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-teal-500">
                          Choisir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Paiement en agence SFD</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!qrGenerated ? (
                      <>
                        <p className="text-sm">Générez un QR code unique que vous présenterez à l'agent SFD pour effectuer votre paiement. Le code est valable 15 minutes.</p>
                        <Button onClick={handleGenerateQrCode} className="w-full">
                          Générer le QR code
                        </Button>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto h-48 w-48 bg-white border-2 border-gray-200 rounded-md flex flex-col items-center justify-center mb-4">
                          <QrCode className="h-32 w-32 text-teal-600 mb-2" />
                          <div className="text-sm font-medium bg-yellow-100 px-3 py-1 rounded-full text-yellow-800">
                            Expire dans: {countdown}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-green-600 mb-2">QR Code généré avec succès</p>
                        <p className="text-xs text-gray-500 mb-4">
                          Présentez ce code à l'agent SFD pour effectuer votre paiement de 3,500 FCFA
                        </p>
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setQrGenerated(false)} className="flex-1">
                            Annuler
                          </Button>
                          <Button onClick={() => window.print()} className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Card className="border p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="font-medium">Historique des paiements</h3>
                </div>
                <div className="space-y-2 mt-3">
                  {loanStatus.paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{payment.date}</p>
                        <p className="text-xs text-gray-500">Paiement {payment.status === 'paid' ? 'réussi' : 'en attente'}</p>
                      </div>
                      <p className="font-bold text-teal-600">${payment.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {mobileMoneyInitiated && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 m-4 max-w-md">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Paiement Mobile Money</h3>
              <p className="text-gray-500 mb-4">Un SMS avec un code de confirmation a été envoyé à votre numéro de téléphone. Veuillez suivre les instructions pour finaliser le paiement.</p>
              <Button onClick={() => setMobileMoneyInitiated(false)} className="w-full">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetailsPage;
