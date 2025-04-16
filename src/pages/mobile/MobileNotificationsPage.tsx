import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Bell, Check, Trash2 } from 'lucide-react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGlobalRealtime, TableSubscription } from '@/hooks/useGlobalRealtime';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  action_link?: string;
}

const MobileNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set up realtime updates for notifications
  const tableSubscriptions: TableSubscription[] = [
    { table: 'admin_notifications', event: 'INSERT' },
    { table: 'admin_notifications', event: 'UPDATE' }
  ];
  
  const { isConnected } = useGlobalRealtime(tableSubscriptions);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from the database
        // This is mock data for demonstration purposes
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Prêt approuvé',
            message: 'Votre demande de prêt a été approuvée. Le décaissement sera effectué prochainement.',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            type: 'loan_approved'
          },
          {
            id: '2',
            title: 'Paiement reçu',
            message: 'Un paiement de 50,000 FCFA a été reçu sur votre compte.',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            type: 'payment_received'
          },
          {
            id: '3',
            title: 'Rappel de remboursement',
            message: 'Votre prochain remboursement de prêt est prévu pour le 15 avril. Veuillez vous assurer que votre compte est suffisamment approvisionné.',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: false,
            type: 'payment_reminder'
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les notifications',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, toast]);
  
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // In a real app, we would update the database
    toast({
      title: 'Notification lue',
      description: 'La notification a été marquée comme lue',
    });
  };
  
  const deleteNotification = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
    
    // In a real app, we would update the database
    toast({
      title: 'Notification supprimée',
      description: 'La notification a été supprimée',
    });
  };
  
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    
    // In a real app, we would update the database
    toast({
      title: 'Toutes lues',
      description: 'Toutes les notifications ont été marquées comme lues',
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-0" 
            onClick={() => navigate('/mobile-flow/main')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Notifications</h1>
            <p className="text-gray-500 text-sm">Vos alertes et mises à jour</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={markAllAsRead}
          disabled={notifications.every(n => n.read)}
        >
          <Check className="h-4 w-4 mr-1" />
          Tout marquer comme lu
        </Button>
      </div>
      
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Chargement des notifications...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`border ${notification.read ? 'border-gray-200' : 'border-[#0D6A51]'} mb-3`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-[#0D6A51]/10'}`}>
                      <Bell className={`h-5 w-5 ${notification.read ? 'text-gray-500' : 'text-[#0D6A51]'}`} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-black'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-500"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-500"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-8 text-center">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 font-medium">Aucune notification</h3>
            <p className="text-sm text-gray-500 mt-1">
              Vous n'avez pas de notifications pour le moment
            </p>
          </div>
        )}
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileNotificationsPage;
