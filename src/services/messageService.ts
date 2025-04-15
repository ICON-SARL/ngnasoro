
import { supabase } from '@/integrations/supabase/client';
import { Message, SendMessageParams } from '@/types/message';

export const messageService = {
  async sendMessage(params: SendMessageParams): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("No authenticated user found");
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...params,
        sender_id: user.id,
        read_by: []
      })
      .select()
      .single();

    if (error) throw error;
    return data as Message;
  },

  async getMessages(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Message[];
  },

  async getThreadMessages(threadId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Message[];
  },

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const { data: message } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();

    if (!message) return;

    const readBy = message.read_by as string[];
    if (!readBy.includes(userId)) {
      const { error } = await supabase
        .from('messages')
        .update({
          read_by: [...readBy, userId]
        })
        .eq('id', messageId);

      if (error) throw error;
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
  },

  subscribeToNewMessages(userId: string, onMessage: (message: Message) => void) {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
