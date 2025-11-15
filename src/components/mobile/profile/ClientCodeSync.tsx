import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, Copy, Check, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getClientCodeForUser, storeClientCode } from '@/utils/client-code/storage';
import { generateClientCode } from '@/utils/client-code/generators';
import { formatClientCode } from '@/utils/client-code/formatters';
import { Loader } from '@/components/ui/loader';
import { motion } from 'framer-motion';

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
      let code = await getClientCodeForUser(user.id);
      
      if (!code) {
        code = generateClientCode();
        const stored = await storeClientCode(user.id, code);
        
        if (stored) {
          setClientCode(formatClientCode(code));
          toast({
            title: "Code client généré",
            description: "Un nouveau code client a été créé pour vous"
          });
        } else {
          setError("Impossible de générer un code client");
        }
      } else {
        setClientCode(formatClientCode(code));
      }
    } catch (err: any) {
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
      <div className="bg-card rounded-xl p-6 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-accent via-accent to-accent/90 text-white rounded-2xl shadow-[0_8px_30px_rgba(252,176,65,0.25)]"
    >
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
      </div>
      
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="p-3 bg-white/20 rounded-full backdrop-blur-sm shadow-lg"
          >
            <Shield className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xl">Code Client Premium</h3>
              <Star className="h-4 w-4 fill-current" />
            </div>
            <p className="text-sm opacity-90">Identifiant unique et sécurisé</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-lg p-3 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <p className="text-sm opacity-90 mb-4">
          Ce code est nécessaire pour la création de votre compte auprès d'une SFD. 
          Conservez-le précieusement et ne le partagez qu'avec votre conseiller SFD.
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
          <code className="text-3xl font-mono font-bold tracking-wider block text-center">
            {clientCode}
          </code>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={handleCopyCode}
            disabled={!clientCode}
            className="w-full bg-white text-accent hover:bg-white/90 font-semibold py-6 rounded-xl shadow-lg transition-all"
          >
            {isCopied ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 mr-2" />
                Copier le code
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClientCodeSync;
