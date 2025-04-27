
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Copy, Check, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getClientCodeForUser, generateClientCode, storeClientCode } from '@/utils/clientCodeUtils';

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
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Code className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-medium text-lg">Code d'identification</h3>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Important
          </Badge>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Ce code unique est nécessaire pour la création de votre compte auprès d'une SFD. 
          Communiquez ce code lors de votre inscription à l'agence.
        </p>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <code className="font-mono text-lg font-semibold">{clientCode}</code>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyCode}
            className="ml-4"
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
