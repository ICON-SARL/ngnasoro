import React, { useState } from 'react';
import { ArrowLeft, DollarSign, CreditCard, Calendar, Clock, MoreHorizontal, QrCode, Smartphone, Download, Building, Wallet, FlowChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface LoanDetailsPageProps {
  onBack: () => void;
}

const LoanDetailsPage: React.FC<LoanDetailsPageProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [qrGenerated, setQrGenerated] = useState(false);
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  
  const loanDetails = {
    store: 'Insting Store',
    paid: 10.40,
    remaining: 15.00,
    progress: 40, // percentage of completion
    disbursed: true, // indique si le prêt a été versé sur le compte SFD
    withdrawn: false, // indique si le montant a été retiré
    payments: [
      { id: 1, date: '05 August 2023', amount: 3.50, status: 'paid' },
      { id: 2, date: '05 July 2023', amount: 3.50, status: 'paid' },
      { id: 3, date: '05 June 2023', amount: 3.50, status: 'paid' }
    ]
  };

  const handleGenerateQrCode = () => {
    setQrGenerated(true);
    toast({
      title: "QR Code généré",
      description: "Présentez ce code à l'agent SFD pour retirer votre argent",
    });
  };

  const handleMobileMoneyWithdrawal = () => {
    setMobileMoneyInitiated(true);
    toast({
      title: "Retrait Mobile Money initié",
      description: "Vérifiez votre téléphone pour confirmer le retrait",
    });
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
          <FlowChart className="h-3 w-3 mr-1" /> Processus
        </Button>
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold">{loanDetails.store}</h1>
        
        <Tabs defaultValue="tracking" className="mt-4">
          <TabsList className="bg-gray-100 rounded-full p-1 mb-6">
            <TabsTrigger value="tracking" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Suivi
            </TabsTrigger>
            <TabsTrigger value="details" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Détails
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Retrait
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracking" className="mt-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-gray-500">Payé à ce jour</p>
                <p className="text-xl font-bold">${loanDetails.paid}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Restant</p>
                <p className="text-xl font-bold">${loanDetails.remaining}</p>
              </div>
            </div>
            
            <div className="relative w-full h-2 bg-gray-100 rounded-full">
              <div 
                className="absolute top-0 left-0 h-2 bg-teal-500 rounded-full" 
                style={{ width: `${loanDetails.progress}%` }}
              ></div>
              <div 
                className="absolute top-0 left-0 h-6 w-6 rounded-full bg-white border-2 border-teal-500 -mt-2 flex items-center justify-center"
                style={{ left: `${loanDetails.progress}%`, marginLeft: '-12px' }}
              >
                <div className="h-3 w-3 rounded-full bg-teal-500"></div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Clock className="h-5 w-5 mr-2" /> En cours
              </h3>
              
              {loanDetails.payments.map((payment, index) => (
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
            
            <Card className="bg-purple-100 border-0 rounded-xl mt-6">
              <CardContent className="p-4">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <img src="/lovable-uploads/ef525c3f-3c63-46c2-a852-9c93524d29df.png" alt="Processing" className="w-16 h-16" />
                  </div>
                  <div>
                    <h3 className="font-bold">Votre prêt est en cours de traitement</h3>
                    <p className="text-sm mt-1">La phase de traitement est une étape importante dans le processus de demande de prêt</p>
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
                      <p className="font-bold">${(loanDetails.paid + loanDetails.remaining).toFixed(2)}</p>
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
          
          <TabsContent value="withdraw" className="mt-2 space-y-4">
            {loanDetails.disbursed && !loanDetails.withdrawn ? (
              <>
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                      <h3 className="font-bold">Fonds disponibles</h3>
                    </div>
                    <p className="text-sm">Votre prêt de <span className="font-bold">${(loanDetails.paid + loanDetails.remaining).toFixed(2)}</span> a été déposé sur votre compte SFD. Vous pouvez maintenant retirer ces fonds.</p>
                  </CardContent>
                </Card>
              
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Options de retrait</h3>
                  
                  <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
                    <CardContent className="p-4" onClick={handleMobileMoneyWithdrawal}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                            <Smartphone className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Mobile Money</h4>
                            <p className="text-xs text-gray-500">Retrait instantané sur votre compte mobile</p>
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
                                <h4 className="font-medium">Retrait en agence SFD</h4>
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
                        <DialogTitle>Retrait en agence SFD</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {!qrGenerated ? (
                          <>
                            <p className="text-sm">Générez un QR code unique que vous présenterez à l'agent SFD pour effectuer votre retrait. Le code est valable 24 heures.</p>
                            <Button onClick={handleGenerateQrCode} className="w-full">
                              Générer le QR code
                            </Button>
                          </>
                        ) : (
                          <div className="text-center">
                            <div className="mx-auto h-48 w-48 bg-white border-2 border-gray-200 rounded-md flex items-center justify-center mb-4">
                              <QrCode className="h-32 w-32 text-teal-600" />
                            </div>
                            <p className="text-sm font-medium text-green-600 mb-2">QR Code généré avec succès</p>
                            <p className="text-xs text-gray-500 mb-4">Valable jusqu'au {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                            <Button variant="outline" onClick={() => setQrGenerated(false)} className="mr-2">
                              Regénérer
                            </Button>
                            <Button onClick={() => window.print()}>
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <Wallet className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Virement bancaire</h4>
                            <p className="text-xs text-gray-500">Transfert vers un compte bancaire externe</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" disabled className="text-gray-400">
                          Bientôt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : loanDetails.withdrawn ? (
              <div className="text-center py-10">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Fonds retirés</h3>
                <p className="text-gray-500">Vous avez déjà retiré les fonds de ce prêt.</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Traitement en cours</h3>
                <p className="text-gray-500">Votre prêt est encore en cours de traitement. Les fonds seront bientôt disponibles sur votre compte SFD.</p>
              </div>
            )}
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
              <h3 className="text-xl font-bold mb-2">Retrait Mobile Money</h3>
              <p className="text-gray-500 mb-4">Un SMS avec un code de confirmation a été envoyé à votre numéro de téléphone. Veuillez suivre les instructions pour finaliser le retrait.</p>
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
