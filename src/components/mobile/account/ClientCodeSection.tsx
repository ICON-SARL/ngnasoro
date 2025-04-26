
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getClientCodeForUser, generateClientCode } from '@/utils/clientCodeUtils';
import { Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ClientCodeSection = () => {
  const [clientCode, setClientCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchClientCode = async () => {
      if (user?.id) {
        const code = await getClientCodeForUser(user.id);
        if (!code && user.id) {
          // Generate a new code if none exists
          const generatedCode = generateClientCode();
          await storeClientCode(user.id, generatedCode);
          setClientCode(generatedCode);
        } else {
          setClientCode(code);
        }
      }
    };
    
    fetchClientCode();
  }, [user?.id]);

  const handleCopyCode = () => {
    if (clientCode) {
      navigator.clipboard.writeText(clientCode);
      setIsCopied(true);
      toast({
        title: "Code copié !",
        description: "Le code a été copié dans le presse-papiers"
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!clientCode) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Code Client</h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Important
          </Badge>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Ce code est nécessaire pour la création de votre compte auprès d'une SFD. 
          Communiquez-le lors de votre inscription.
        </p>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <code className="font-mono text-base">{clientCode}</code>
          <Button 
            variant="outline" 
            size="sm"
            className="ml-2"
            onClick={handleCopyCode}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCodeSection;
