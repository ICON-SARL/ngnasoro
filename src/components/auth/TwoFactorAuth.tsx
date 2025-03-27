
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCode } from '@/components/ui/qr-code';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorAuthProps {
  userId: string;
  onComplete: (success: boolean) => void;
  mode: 'setup' | 'verify';
}

export function TwoFactorAuth({ userId, onComplete, mode }: TwoFactorAuthProps) {
  const [step, setStep] = useState<'generate' | 'verify' | 'success'>(mode === 'setup' ? 'generate' : 'verify');
  const [isLoading, setIsLoading] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Generate 2FA credentials
  const generate2FA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-2fa', {
        body: { userId }
      });

      if (error) throw error;
      
      setSecretKey(data.secret);
      setQrCode(data.qrCode);
      setStep('verify');
    } catch (error) {
      console.error('Error generating 2FA:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer les informations 2FA. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify 2FA code
  const verify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Code incomplet',
        description: 'Veuillez entrer un code à 6 chiffres',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: { 
          userId,
          code: verificationCode,
          secret: secretKey,
          mode
        }
      });

      if (error) throw error;
      
      if (data.verified) {
        setStep('success');
        
        // Update user's 2FA status in the database
        if (mode === 'setup') {
          await supabase
            .from('admin_users')
            .update({ has_2fa: true })
            .eq('id', userId);
        }
        
        setTimeout(() => onComplete(true), 2000);
      } else {
        throw new Error('Code de vérification invalide');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: 'Vérification échouée',
        description: error.message || 'Code incorrect. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initial component mount
  React.useEffect(() => {
    if (mode === 'setup') {
      generate2FA();
    }
  }, [mode]);

  if (step === 'generate') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'authentification à deux facteurs</CardTitle>
          <CardDescription>
            Sécurisez votre compte avec l'authentification à deux facteurs
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={generate2FA}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              'Commencer la configuration'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'setup' ? 'Configurez votre application' : 'Vérification à deux facteurs'}
          </CardTitle>
          <CardDescription>
            {mode === 'setup' 
              ? 'Scannez ce code QR avec votre application d\'authentification' 
              : 'Entrez le code de votre application d\'authentification'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'setup' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-white rounded">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>Clé secrète (si vous ne pouvez pas scanner le QR code):</p>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1">{secretKey}</p>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Entrez le code à 6 chiffres:</p>
            <InputOTP 
              maxLength={6} 
              value={verificationCode}
              onChange={setVerificationCode}
              containerClassName="justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={verify2FA}
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification en cours...
              </>
            ) : (
              'Vérifier'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration réussie</CardTitle>
          <CardDescription>
            L'authentification à deux facteurs est maintenant activée
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <p className="text-center">
            Votre compte est maintenant protégé par l'authentification à deux facteurs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export default TwoFactorAuth;
