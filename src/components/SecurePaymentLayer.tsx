import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CreditCard, Smartphone, QrCode, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SecurePaymentLayer = () => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  const handlePayment = () => {
    // Simuler une transaction réussie
    setTimeout(() => {
      setPaymentStatus('success');
      toast({
        title: "Paiement réussi",
        description: "Votre paiement a été traité avec succès.",
      });
    }, 2000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Sécurisation du Paiement
        </CardTitle>
        <CardDescription>
          Choisissez votre méthode de paiement préférée
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="payment-options">
          <TabsList className="mb-4">
            <TabsTrigger value="payment-options">Options de Paiement</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payment-options">
            <RadioGroup defaultValue={paymentMethod} className="space-y-2" onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit-card" id="credit-card" />
                <Label htmlFor="credit-card" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Carte de Crédit
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile-money" id="mobile-money" />
                <Label htmlFor="mobile-money" className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile Money
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="qr-code" id="qr-code" />
                <Label htmlFor="qr-code" className="flex items-center">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Label>
              </div>
            </RadioGroup>
            
            {paymentMethod === 'credit-card' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Numéro de carte</Label>
                  <Input 
                    type="text" 
                    id="card-number" 
                    placeholder="**** **** **** ****" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry-date">Date d'expiration</Label>
                    <Input 
                      type="text" 
                      id="expiry-date" 
                      placeholder="MM/AA" 
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      type="text" 
                      id="cvv" 
                      placeholder="123" 
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'mobile-money' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Numéro de téléphone</Label>
                  <Input 
                    type="tel" 
                    id="phone-number" 
                    placeholder="6XXXXXXXX" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {paymentMethod === 'qr-code' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-code-input">QR Code</Label>
                  <Input 
                    type="text" 
                    id="qr-code-input" 
                    placeholder="Scan QR Code" 
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="security">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Vos informations de paiement sont cryptées et sécurisées.
              </AlertDescription>
            </Alert>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>
                <Lock className="inline-block h-4 w-4 mr-2" />
                Cryptage SSL 256 bits
              </li>
              <li>
                <CheckCircle className="inline-block h-4 w-4 mr-2" />
                Conforme aux normes PCI DSS
              </li>
              <li>
                <Shield className="inline-block h-4 w-4 mr-2" />
                Protection contre la fraude
              </li>
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="bg-[#0D6A51] hover:bg-[#0D6A51]/90" onClick={handlePayment}>
          Effectuer le Paiement
        </Button>
      </CardFooter>
    </Card>
  );
};
