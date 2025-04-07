
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, QrCode, Check, Building, BadgeCheck, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export const PaymentOptions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleDirectDebit = () => {
    setLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    
    setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
      setProgress(100);
      toast({
        title: "Configuration réussie",
        description: "Le prélèvement automatique a été configuré avec succès.",
      });
    }, 1500);
  };
  
  const handleMobilePayment = () => {
    setLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    
    setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
      setProgress(100);
      toast({
        title: "Paiement initié",
        description: "Veuillez confirmer le paiement sur votre téléphone.",
      });
    }, 1500);
  };
  
  const generateQrCode = () => {
    setLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    
    setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
      setProgress(100);
      setQrGenerated(true);
    }, 1500);
  };
  
  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/90 text-white">
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Options de Paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs defaultValue="direct-debit">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="direct-debit" className="data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
              <Building className="h-4 w-4 mr-2" />
              Débit SFD
            </TabsTrigger>
            <TabsTrigger value="mobile-money" className="data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile Money
            </TabsTrigger>
            <TabsTrigger value="agency" className="data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
              <QrCode className="h-4 w-4 mr-2" />
              En Agence
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct-debit" className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-start">
                <ShieldCheck className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-600 mb-1 font-medium">Paiement automatique sécurisé</p>
                  <p className="text-xs text-blue-500">
                    Le prélèvement automatique est effectué directement sur votre compte SFD le jour de l'échéance. 
                    Assurez-vous d'avoir un solde suffisant pour éviter tout rejet.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div>
                  <Label htmlFor="account" className="text-sm font-medium">Numéro de compte SFD</Label>
                  <div className="flex items-center mt-1">
                    <div className="h-8 w-8 rounded-lg bg-[#0D6A51]/10 flex items-center justify-center mr-2">
                      <Building className="h-4 w-4 text-[#0D6A51]" />
                    </div>
                    <div className="flex-1">
                      <Input id="account" placeholder="Ex: 1234-5678-9012-3456" className="border-0 bg-white shadow-sm" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <BadgeCheck className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-500">Vérification automatique du compte</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl">
                <Label className="text-sm font-medium">Date de prélèvement</Label>
                <RadioGroup defaultValue="exact" className="mt-2">
                  <div className="flex items-center space-x-2 py-2 pl-2 hover:bg-white rounded-lg transition-colors">
                    <RadioGroupItem value="exact" id="exact" className="text-[#0D6A51]" />
                    <Label htmlFor="exact" className="font-normal text-sm cursor-pointer">
                      À la date d'échéance exacte
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 py-2 pl-2 hover:bg-white rounded-lg transition-colors">
                    <RadioGroupItem value="before" id="before" className="text-[#0D6A51]" />
                    <Label htmlFor="before" className="font-normal text-sm cursor-pointer">
                      3 jours avant l'échéance
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {loading && (
                <div className="mt-2 mb-4">
                  <Progress value={progress} className="h-2 bg-gray-100" />
                  <p className="text-xs text-center mt-1 text-gray-500">Configuration en cours...</p>
                </div>
              )}
              
              <Button 
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 h-12 rounded-xl"
                onClick={handleDirectDebit}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Configuration en cours...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <BadgeCheck className="h-5 w-5 mr-2" />
                    Configurer le prélèvement automatique
                  </div>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="mobile-money" className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-xl mb-4">
              <div className="flex items-start">
                <Smartphone className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-600">
                  Payez directement depuis votre téléphone. Les fonds seront instantanément débloqués après confirmation.
                </p>
              </div>
            </div>
            
            <RadioGroup defaultValue="orange-money" className="space-y-3">
              <div className="flex items-center p-3 rounded-xl border bg-white shadow-sm hover:bg-orange-50/20 transition-colors">
                <RadioGroupItem value="orange-money" id="orange-money" className="text-orange-500" />
                <Label htmlFor="orange-money" className="font-normal flex items-center ml-2 cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                    <span className="text-orange-500 font-bold text-sm">OM</span>
                  </div>
                  <div>
                    <p className="font-medium">Orange Money</p>
                    <p className="text-xs text-gray-500">Transfert instantané</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center p-3 rounded-xl border bg-white shadow-sm hover:bg-blue-50/20 transition-colors">
                <RadioGroupItem value="wave" id="wave" className="text-blue-500" />
                <Label htmlFor="wave" className="font-normal flex items-center ml-2 cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-500 font-bold text-sm">WV</span>
                  </div>
                  <div>
                    <p className="font-medium">Wave</p>
                    <p className="text-xs text-gray-500">Sans frais</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center p-3 rounded-xl border bg-white shadow-sm hover:bg-yellow-50/20 transition-colors">
                <RadioGroupItem value="mtn" id="mtn" className="text-yellow-500" />
                <Label htmlFor="mtn" className="font-normal flex items-center ml-2 cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3">
                    <span className="text-yellow-500 font-bold text-sm">MTN</span>
                  </div>
                  <div>
                    <p className="font-medium">MTN Mobile Money</p>
                    <p className="text-xs text-gray-500">Disponible partout</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <Label htmlFor="phone" className="text-sm font-medium">Numéro de téléphone</Label>
              <Input id="phone" placeholder="Ex: +225 07 XX XX XX XX" className="mt-1 border-0 bg-white shadow-sm" />
            </div>
            
            {loading && (
              <div className="mt-2 mb-2">
                <Progress value={progress} className="h-2 bg-gray-100" />
                <p className="text-xs text-center mt-1 text-gray-500">Envoi en cours...</p>
              </div>
            )}
            
            <Button 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 h-12 rounded-xl"
              onClick={handleMobilePayment}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Paiement en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Payer maintenant
                </div>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="agency" className="space-y-6">
            {!qrGenerated ? (
              <>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-start">
                    <QrCode className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-purple-600 mb-1 font-medium">Paiement en agence</p>
                      <p className="text-xs text-purple-500">
                        Générez un QR code unique qui pourra être scanné dans n'importe quelle agence SFD 
                        pour effectuer votre paiement. Le QR code est valable 72 heures.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <Label htmlFor="payment-amount" className="text-sm font-medium">Montant du paiement</Label>
                    <Input id="payment-amount" type="text" value="38,736 FCFA" readOnly className="mt-1 bg-white shadow-sm border-0" />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <Label htmlFor="payment-reference" className="text-sm font-medium">Référence du paiement</Label>
                    <Input id="payment-reference" value="REF-PAY-2023-04587" readOnly className="mt-1 bg-white shadow-sm border-0" />
                  </div>
                  
                  {loading && (
                    <div className="mt-2 mb-2">
                      <Progress value={progress} className="h-2 bg-gray-100" />
                      <p className="text-xs text-center mt-1 text-gray-500">Génération en cours...</p>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 h-12 rounded-xl"
                    onClick={generateQrCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <QrCode className="h-5 w-5 mr-2" />
                        Générer un QR code de paiement
                      </div>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="animate-fade-in">
                  <div className="mx-auto h-64 w-64 bg-white border-2 border-gray-200 rounded-md flex items-center justify-center mb-4 shadow-lg">
                    <QrCode className="h-48 w-48 text-[#0D6A51]" />
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl mb-4">
                    <div className="flex items-center text-green-600 mb-2">
                      <Check className="h-5 w-5 mr-2" />
                      <span className="font-medium">QR Code généré avec succès</span>
                    </div>
                    <p className="text-xs text-green-600">
                      Présentez ce QR code à l'agent de la SFD pour effectuer votre paiement. 
                      Valable jusqu'au {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setQrGenerated(false)} className="rounded-xl">
                    Retour aux options
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
