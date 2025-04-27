
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getClientCodeForUser, storeClientCode } from '@/utils/client-code/storage';
import { generateClientCode } from '@/utils/client-code/generators';
import { formatClientCode } from '@/utils/client-code/formatters';
import { Loader } from '@/components/ui/loader';

const ClientCodeSync: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientCode, setClientCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadClientCode();
    }
  }, [user?.id]);

  const loadClientCode = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading client code for user:', user.id);
      let code = await getClientCodeForUser(user.id);
      
      if (!code) {
        console.log('No existing client code, generating new one');
        code = generateClientCode();
        const stored = await storeClientCode(user.id, code);
        
        if (stored) {
          console.log('New client code stored successfully:', code);
          setClientCode(formatClientCode(code));
          toast({
            title: "Code client généré",
            description: "Un nouveau code client a été créé pour vous"
          });
        } else {
          setError("Impossible de générer un code client");
        }
      } else {
        console.log('Existing client code found:', code);
        setClientCode(formatClientCode(code));
      }
    } catch (err: any) {
      console.error("Error loading client code:", err);
      setError(err.message || "Erreur lors du chargement du code client");
      toast({
        title: "Erreur",
        description: "Impossible de charger votre code client",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!clientCode) return;
    
    navigator.clipboard.writeText(clientCode);
    setIsCopied(true);
    toast({
      title: "Code copié",
      description: "Le code client a été copié dans le presse-papiers"
    });
    
    setTimeout(() => setIsCopied(false), 3000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Code Client</h3>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <p className="text-sm text-gray-500 mb-4">
          Votre code client unique est nécessaire pour la création de votre compte auprès d'une SFD.
          Conservez-le précieusement.
        </p>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
          <code className="font-mono text-base font-semibold">{clientCode}</code>
          <Button 
            variant="outline" 
            size="sm"
            className="ml-2"
            onClick={handleCopyCode}
            disabled={!clientCode}
          >
            {isCopied ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCodeSync;
