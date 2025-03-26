
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RotateCw, Shield, AlertTriangle, Fingerprint, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface MobileMoneyTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
}

export const MobileMoneyTab: React.FC<MobileMoneyTabProps> = ({ paymentStatus, handlePayment }) => {
  const { toast } = useToast();
  const [provider, setProvider] = useState('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSecondFactorSent, setIsSecondFactorSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [securityInfo, setSecurityInfo] = useState<{
    dailyLimit: number;
    usedToday: number;
    remainingLimit: number;
    securityMethod: string;
  }>({
    dailyLimit: 500000, // 500,000 FCFA default
    usedToday: 0,
    remainingLimit: 500000,
    securityMethod: 'Certificat client'
  });

  const handleProviderChange = (value: string) => {
    setProvider(value);
    
    // Simulate fetching user limits for the selected provider
    // And update security method based on provider
    setTimeout(() => {
      const mockLimits = {
        orange: { dailyLimit: 500000, usedToday: 125000, securityMethod: 'Certificat client' },
        wave: { dailyLimit: 750000, usedToday: 200000, securityMethod: 'HMAC-SHA256' },
        mtn: { dailyLimit: 1000000, usedToday: 450000, securityMethod: 'OAuth2 + IP Whitelisting' }
      };
      
      const limits = mockLimits[value as keyof typeof mockLimits];
      setSecurityInfo({
        dailyLimit: limits.dailyLimit,
        usedToday: limits.usedToday,
        remainingLimit: limits.dailyLimit - limits.usedToday,
        securityMethod: limits.securityMethod
      });
    }, 500);
  };

  const sendVerificationCode = () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro de téléphone valide",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate sending a verification code
    toast({
      title: "Code envoyé",
      description: "Un code de vérification a été envoyé à votre téléphone",
    });
    
    setIsSecondFactorSent(true);
  };

  const initiatePayment = () => {
    if (!isSecondFactorSent) {
      sendVerificationCode();
      return;
    }
    
    if (!verificationCode || verificationCode.length < 4) {
      toast({
        title: "Code invalide",
        description: "Veuillez entrer le code de vérification",
        variant: "destructive"
      });
      return;
    }
    
    // Check daily limit
    if (25000 > securityInfo.remainingLimit) {
      toast({
        title: "Plafond dépassé",
        description: `Vous avez dépassé votre plafond journalier de ${securityInfo.dailyLimit.toLocaleString()} FCFA`,
        variant: "destructive"
      });
      return;
    }
    
    // Proceed with payment
    handlePayment();
  };

  const formatProviderName = (provider: string) => {
    switch(provider) {
      case 'orange': return 'Orange Money';
      case 'wave': return 'Wave';
      case 'mtn': return 'MTN Mobile Money';
      default: return provider;
    }
  };

  return (
    <>
      <div>
        <Label>Service Mobile Money</Label>
        <Select value={provider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="orange">Orange Money</SelectItem>
            <SelectItem value="wave">Wave</SelectItem>
            <SelectItem value="mtn">MTN Mobile Money</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Lock className="h-3 w-3 mr-1" />
          Sécurisé par {securityInfo.securityMethod}
        </div>
      </div>

      {securityInfo.remainingLimit < 25000 && (
        <Alert variant="destructive" className="my-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Plafond journalier de {formatProviderName(provider)} presque atteint. 
            Disponible: {securityInfo.remainingLimit.toLocaleString()} FCFA
          </AlertDescription>
        </Alert>
      )}
      
      <div>
        <Label>Numéro de téléphone</Label>
        <Input 
          type="tel" 
          placeholder="+223 XX XX XX XX" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>
      
      <div>
        <Label>Montant</Label>
        <Input type="text" value="25,000 FCFA" readOnly />
        <p className="text-xs text-muted-foreground mt-1">
          Plafond journalier: {securityInfo.usedToday.toLocaleString()} / {securityInfo.dailyLimit.toLocaleString()} FCFA utilisés
        </p>
      </div>

      {isSecondFactorSent && (
        <div>
          <Label className="flex items-center">
            <Fingerprint className="h-4 w-4 mr-1 text-[#0D6A51]" />
            Code de vérification
          </Label>
          <Input 
            type="text" 
            placeholder="XXXX" 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Un code a été envoyé au {phoneNumber}
          </p>
        </div>
      )}
      
      {paymentStatus === 'pending' ? (
        <Button disabled className="w-full">
          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
          Traitement en cours...
        </Button>
      ) : (
        <Button 
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          onClick={initiatePayment}
        >
          {isSecondFactorSent ? 'Confirmer le paiement' : 'Recevoir le code'}
        </Button>
      )}
    </>
  );
};
