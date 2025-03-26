
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Shield, 
  Phone, 
  CreditCard, 
  Building, 
  Fingerprint, 
  AlertTriangle, 
  Check, 
  RotateCw,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurePaymentTabProps {
  onBack: () => void;
}

const SecurePaymentTab: React.FC<SecurePaymentTabProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('sfd');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [isDoubleApproval, setIsDoubleApproval] = useState(true);
  const [balanceStatus, setBalanceStatus] = useState<'sufficient' | 'insufficient'>('sufficient');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  
  // Simulate automatic detection of the main SFD account
  useEffect(() => {
    const detectPrimaryAccount = () => {
      // Simulate an API check for balance
      const randomBalance = Math.random();
      if (randomBalance < 0.3) {
        setBalanceStatus('insufficient');
        setPaymentMethod('mobile');
        toast({
          title: "Compte SFD insuffisant",
          description: "Basculement automatique vers Mobile Money",
          variant: "default",
        });
      } else {
        setBalanceStatus('sufficient');
        setPaymentMethod('sfd');
      }
    };
    
    detectPrimaryAccount();
  }, [toast]);
  
  const handlePayment = () => {
    setPaymentStatus('pending');
    
    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      if (success) {
        setPaymentStatus('success');
        toast({
          title: "Paiement réussi",
          description: "Transaction traitée avec succès et tokenisée.",
          variant: "default",
        });
      } else {
        setPaymentStatus('failed');
        toast({
          title: "Échec du paiement",
          description: "Veuillez réessayer ou sélectionner une autre méthode.",
          variant: "destructive",
        });
      }
    }, 2000);
  };
  
  const requestBiometricVerification = () => {
    toast({
      title: "Vérification biométrique",
      description: "Veuillez valider votre identité via votre appareil mobile.",
    });
    
    // Simulate biometric verification
    setTimeout(() => {
      toast({
        title: "Identité confirmée",
        description: "Vérification biométrique réussie.",
      });
    }, 2000);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 pb-24">
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4" 
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour
      </Button>
      
      <div className="flex items-center mb-4">
        <Shield className="h-5 w-5 mr-2 text-[#0D6A51]" />
        <h2 className="text-lg font-medium">Paiement Sécurisé</h2>
      </div>
      
      {balanceStatus === 'insufficient' && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-600">Solde insuffisant</AlertTitle>
          <AlertDescription className="text-amber-700">
            Votre compte SFD principal n'a pas un solde suffisant. Nous avons automatiquement sélectionné le paiement par Mobile Money.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue={paymentMethod} onValueChange={(value) => setPaymentMethod(value)} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger 
            value="sfd" 
            disabled={balanceStatus === 'insufficient'}
            className={balanceStatus === 'insufficient' ? 'opacity-50' : ''}
          >
            <Building className="h-4 w-4 mr-2" />
            Compte SFD
          </TabsTrigger>
          <TabsTrigger value="mobile">
            <Phone className="h-4 w-4 mr-2" />
            Mobile Money
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sfd" className="space-y-4">
          <div>
            <Label>Compte SFD</Label>
            <Select defaultValue="primary">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un compte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">SFD Bamako Principal (•••• 1234)</SelectItem>
                <SelectItem value="secondary">SFD Sikasso (•••• 5678)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Compte tokenisé conforme PCI DSS Level 1
            </p>
          </div>
          
          <div>
            <Label>Montant</Label>
            <Input type="text" value="25,000 FCFA" readOnly />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="biometric" 
              checked={isBiometricEnabled}
              onCheckedChange={setIsBiometricEnabled}
            />
            <Label htmlFor="biometric" className="flex items-center">
              <Fingerprint className="h-4 w-4 mr-1 text-[#0D6A51]" />
              Vérification biométrique
            </Label>
          </div>
          
          {paymentStatus === 'pending' ? (
            <Button disabled className="w-full">
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Traitement en cours...
            </Button>
          ) : (
            <Button 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={handlePayment}
            >
              Payer maintenant
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="mobile" className="space-y-4">
          <div>
            <Label>Service Mobile Money</Label>
            <Select defaultValue="orange">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orange">Orange Money</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Numéro de téléphone</Label>
            <Input type="tel" placeholder="+223 XX XX XX XX" />
          </div>
          
          <div>
            <Label>Montant</Label>
            <Input type="text" value="25,000 FCFA" readOnly />
          </div>
          
          {paymentStatus === 'pending' ? (
            <Button disabled className="w-full">
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Traitement en cours...
            </Button>
          ) : (
            <Button 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={handlePayment}
            >
              Payer maintenant
            </Button>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Advanced security section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium mb-4 flex items-center">
          <Shield className="h-4 w-4 mr-2 text-[#0D6A51]" />
          Fonctionnalités de sécurité avancées
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Fingerprint className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Vérification biométrique</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Requise pour les transactions supérieures à 50,000 FCFA
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={requestBiometricVerification}
              >
                Vérifier maintenant
              </Button>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Check className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Double approbation</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Pour les remboursements anticipés et transactions sensibles
              </p>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="double-approval" 
                  checked={isDoubleApproval}
                  onCheckedChange={setIsDoubleApproval}
                />
                <Label htmlFor="double-approval">Activée</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reconciliation section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <ArrowUp className="h-4 w-4 mr-2 text-[#0D6A51]" />
          <ArrowDown className="h-4 w-4 mr-2 text-[#0D6A51]" />
          Réconciliation journalière
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Vos transactions sont réconciliées chaque jour à 23h00 via le protocole CAMT.053
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-2 rounded-md text-center">
            <p className="text-xs font-medium">Dernière réconciliation</p>
            <p className="text-sm">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-muted p-2 rounded-md text-center">
            <p className="text-xs font-medium">Statut</p>
            <p className="text-sm flex items-center justify-center">
              <Check className="h-3 w-3 mr-1 text-green-600" />
              Complété
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurePaymentTab;
