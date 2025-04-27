
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getClientCodeForUser, generateClientCode, storeClientCode, synchronizeClientCode } from '@/utils/clientCodeUtils';
import { Loader } from '@/components/ui/loader';

const ClientCodeSync: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientCode, setClientCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
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
      const code = await getClientCodeForUser(user.id);
      if (code) {
        setClientCode(code);
      } else {
        const newCode = generateClientCode();
        const stored = await storeClientCode(user.id, newCode);
        if (stored) {
          setClientCode(newCode);
        } else {
          setError("Impossible de générer un code client");
        }
      }
    } catch (err) {
      console.error("Error loading client code:", err);
      setError("Erreur lors du chargement du code client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncCode = async () => {
    if (!user?.id || !clientCode) return;
    
    setIsSyncing(true);
    setError(null);
    
    try {
      const success = await synchronizeClientCode(user.id, clientCode);
      if (success) {
        toast({
          title: "Synchronisation réussie",
          description: "Votre code client a été synchronisé avec succès"
        });
      } else {
        setError("La synchronisation a échoué");
      }
    } catch (err) {
      console.error("Error syncing client code:", err);
      setError("Erreur lors de la synchronisation");
    } finally {
      setIsSyncing(false);
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
          Assurez-vous qu'il est synchronisé avec tous vos comptes.
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
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={handleSyncCode}
            disabled={isSyncing || !clientCode}
          >
            {isSyncing ? (
              <Loader size="sm" className="mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Synchroniser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCodeSync;
