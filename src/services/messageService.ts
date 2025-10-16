
import { supabase } from '@/integrations/supabase/client';
import { Message, SendMessageParams } from '@/types/message';

// Note: messages table doesn't exist - using admin_notifications as substitute
export const messageService = {
  async sendMessage(params: SendMessageParams): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("No authenticated user found");
    }
    
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        user_id: params.recipient_id || user.id,
        title: 'New Message',
        message: params.content,
        type: params.type || 'info',
        action_url: params.thread_id ? `/messages/${params.thread_id}` : undefined
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform to Message format
    return {
      id: data.id,
      sender_id: user.id,
      recipient_id: data.user_id,
      content: data.message,
      type: data.type as any,
      read_by: data.is_read ? [data.user_id] : [],
      created_at: data.created_at,
      updated_at: data.created_at
    } as Message;
  },

  async getMessages(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(notif => ({
      id: notif.id,
      sender_id: notif.user_id,
      recipient_id: notif.user_id,
      content: notif.message,
      type: notif.type as any,
      read_by: notif.is_read ? [notif.user_id] : [],
      created_at: notif.created_at,
      updated_at: notif.created_at
    })) as Message[];
  },

  async getThreadMessages(threadId: string): Promise<Message[]> {
    // Thread functionality not supported with admin_notifications
    return [];
  },

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  },

  subscribeToNewMessages(userId: string, onMessage: (message: Message) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notif = payload.new as any;
          onMessage({
            id: notif.id,
            sender_id: notif.user_id,
            recipient_id: notif.user_id,
            content: notif.message,
            type: notif.type,
            read_by: [],
            created_at: notif.created_at,
            updated_at: notif.created_at
          } as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
