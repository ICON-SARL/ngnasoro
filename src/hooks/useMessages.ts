import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Message, UserRoleType } from '@/types/message';
import { messageService } from '@/services/messageService';
import { useToast } from '@/hooks/use-toast';

export const useMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await messageService.getMessages(user.id);
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = messageService.subscribeToNewMessages(user.id, (newMessage) => {
      setMessages(prev => [newMessage, ...prev]);
      toast({
        title: "Nouveau message",
        description: newMessage.content.substring(0, 50) + "...",
      });
    });

    fetchMessages();
    return unsubscribe;
  }, [user?.id]);

  const sendMessage = async (content: string, recipientId?: string, recipientRole?: UserRoleType) => {
    if (!user?.id) return;

    try {
      const message = await messageService.sendMessage({
        content,
        recipient_id: recipientId,
        recipient_role: recipientRole,
        type: recipientRole ? 'group' : 'direct'
      });
      setMessages(prev => [message, ...prev]);
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user?.id) return;

    try {
      await messageService.markAsRead(messageId, user.id);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, read_by: [...(msg.read_by || []), user.id] }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    deleteMessage
  };
};
