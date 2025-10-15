
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: string;
  metadata?: any;
  user_id?: string;
  action_url?: string;
}

export function NotificationsOverlay() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Get current user's ID
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getUser();
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.length);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('notification-updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'admin_notifications',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          const newNotification = payload.new as Notification;
          
          console.log('New notification received:', newNotification);
          
          // Add to local state
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(count => count + 1);
          
          // Show toast notification with enhanced transaction information
          if (newNotification.type === 'transaction') {
            // Extract and format transaction information if available
            const transactionAmount = newNotification.metadata?.amount 
              ? formatCurrency(newNotification.metadata.amount) 
              : '';
              
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: 'default',
              action: (
                <Badge variant="outline" className="ml-2 bg-green-100">
                  Transaction
                </Badge>
              )
            });
            
            // Show notification briefly
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 5000);
          } else {
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();
      
    // Also listen for transaction updates specifically
    const transactionChannel = supabase
      .channel('transaction-updates')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newTransaction = payload.new;
          console.log('New transaction detected:', newTransaction);
          
          // Check if this is a credit or debit
          const isCredit = newTransaction.amount > 0 || 
                          newTransaction.type === 'deposit' || 
                          newTransaction.type === 'loan_disbursement';
                          
          const transactionType = isCredit ? 'crédit' : 'débit';
          const amount = Math.abs(Number(newTransaction.amount));
          
          // Show a special transaction notification
          toast({
            title: `${isCredit ? 'Crédit' : 'Débit'} effectué`,
            description: `Un ${transactionType} de ${formatCurrency(amount)} FCFA a été effectué sur votre compte.`,
            variant: 'default', // Changed from 'secondary' to 'default'
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(transactionChannel);
    };
  }, [userId, toast]);

  const markAsRead = async (id: string) => {
    if (!userId) return;
    
    await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', id);
      
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(count => count - 1);
  };

  // No visible UI for now, just handles the notifications
  return null;
}
