
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, QrCode, Check, Building } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const PaymentOptions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  
  const handleDirectDebit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Configuration réussie",
        description: "Le prélèvement automatique a été configuré avec succès.",
      });
    }, 1500);
  };
  
  const handleMobilePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Paiement initié",
        description: "Veuillez confirmer le paiement sur votre téléphone.",
      });
    }, 1500);
  };
  
  const generateQrCode = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setQrGenerated(true);
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Options de Paiement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="direct-debit">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="direct-debit">
              <Building className="h-4 w-4 mr-2" />
              Débit SFD
            </TabsTrigger>
            <TabsTrigger value="mobile-money">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile Money
            </TabsTrigger>
            <TabsTrigger value="agency">
              <QrCode className="h-4 w-4 mr-2" />
              En Agence
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct-debit" className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-600 mb-2 font-medium">Paiement automatique</p>
              <p className="text-xs text-blue-500">
                Le prélèvement automatique est effectué directement sur votre compte SFD le jour de l'échéance. 
                Assurez-vous d'avoir un solde suffisant pour éviter tout rejet.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="account">Numéro de compte SFD</Label>
                <Input id="account" placeholder="Ex: 1234-5678-9012-3456" />
              </div>
              
              <div>
                <Label>Date de prélèvement</Label>
                <RadioGroup defaultValue="exact">
                  <div className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value="exact" id="exact" />
                    <Label htmlFor="exact" className="font-normal">
                      À la date d'échéance exacte
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value="before" id="before" />
                    <Label htmlFor="before" className="font-normal">
                      3 jours avant l'échéance
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                onClick={handleDirectDebit}
                disabled={loading}
              >
                {loading ? "Configuration en cours..." : "Configurer le prélèvement automatique"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="mobile-money" className="space-y-6">
            <RadioGroup defaultValue="orange-money">
              <div className="flex items-center space-x-2 p-3 rounded-md border">
                <RadioGroupItem value="orange-money" id="orange-money" />
                <Label htmlFor="orange-money" className="font-normal flex items-center">
                  <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center mr-2">
                    <span className="text-orange-500 font-bold text-xs">OM</span>
                  </div>
                  Orange Money
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-md border">
                <RadioGroupItem value="wave" id="wave" />
                <Label htmlFor="wave" className="font-normal flex items-center">
                  <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center mr-2">
                    <span className="text-blue-500 font-bold text-xs">WV</span>
                  </div>
                  Wave
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-md border">
                <RadioGroupItem value="mtn" id="mtn" />
                <Label htmlFor="mtn" className="font-normal flex items-center">
                  <div className="h-8 w-8 rounded bg-yellow-100 flex items-center justify-center mr-2">
                    <span className="text-yellow-500 font-bold text-xs">MTN</span>
                  </div>
                  MTN Mobile Money
                </Label>
              </div>
            </RadioGroup>
            
            <div>
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input id="phone" placeholder="Ex: +225 07 XX XX XX XX" />
            </div>
            
            <Button 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={handleMobilePayment}
              disabled={loading}
            >
              {loading ? "Paiement en cours..." : "Payer maintenant"}
            </Button>
          </TabsContent>
          
          <TabsContent value="agency" className="space-y-6">
            {!qrGenerated ? (
              <>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm mb-2 font-medium">Paiement en agence</p>
                  <p className="text-xs text-muted-foreground">
                    Générez un QR code unique qui pourra être scanné dans n'importe quelle agence SFD 
                    pour effectuer votre paiement. Le QR code est valable 72 heures.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-amount">Montant du paiement</Label>
                    <Input id="payment-amount" type="text" value="38,736 FCFA" readOnly />
                  </div>
                  
                  <div>
                    <Label htmlFor="payment-reference">Référence du paiement</Label>
                    <Input id="payment-reference" value="REF-PAY-2023-04587" readOnly />
                  </div>
                  
                  <Button 
                    className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    onClick={generateQrCode}
                    disabled={loading}
                  >
                    {loading ? "Génération en cours..." : "Générer un QR code de paiement"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto h-64 w-64 bg-white border-2 border-gray-200 rounded-md flex items-center justify-center mb-4">
                  <QrCode className="h-48 w-48 text-[#0D6A51]" />
                </div>
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <div className="flex items-center text-green-600 mb-2">
                    <Check className="h-5 w-5 mr-2" />
                    <span className="font-medium">QR Code généré avec succès</span>
                  </div>
                  <p className="text-xs text-green-600">
                    Présentez ce QR code à l'agent de la SFD pour effectuer votre paiement. 
                    Valable jusqu'au {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setQrGenerated(false)}>
                  Retour aux options
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
