
import { useCallback, useState } from 'react';
import { adminCommunicationApi } from '@/utils/api/modules/adminCommunicationApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useAdminCommunications() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendMessage = useCallback(async (content: string, recipientId?: string, recipientRole?: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour envoyer des messages",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await adminCommunicationApi.synchronizeAccounts(
        user.id,
        recipientId
      );

      if (result.success) {
        toast({
          title: "Message envoyé",
          description: "Votre message a été envoyé avec succès"
        });
        return true;
      } else {
        throw new Error(result.message || "Échec de l'envoi du message");
      }
    } catch (err: any) {
      const message = err?.message || "Une erreur est survenue lors de l'envoi du message";
      setError(message);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const testConnection = useCallback(async () => {
    if (!user) return false;
    
    try {
      const result = await adminCommunicationApi.pingAdminServer();
      return !!result?.success;
    } catch (err) {
      console.error("Erreur lors du test de connexion:", err);
      return false;
    }
  }, [user]);

  return {
    isLoading,
    error,
    sendMessage,
    testConnection
  };
}
