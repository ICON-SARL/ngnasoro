import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Bell, ArrowLeft, CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useGlobalRealtime, TableSubscription } from '@/hooks/useGlobalRealtime';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const MobileNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set up real-time listener for notifications
  const tableSubscriptions: TableSubscription[] = [
    { table: 'notifications', event: 'INSERT' }
  ];
  
  const { isConnected } = useGlobalRealtime(tableSubscriptions);
  
  useEffect(() => {
    // Mock notifications for demo
    setNotifications([
      {
        id: '1',
        title: 'Paiement reçu',
        message: 'Votre paiement de 15 000 FCFA a été reçu avec succès',
        created_at: new Date().toISOString(),
        read: false,
        type: 'success'
      },
      {
        id: '2',
        title: 'Demande de prêt en cours d\'examen',
        message: 'Votre demande de prêt est en cours d\'examen par notre équipe',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        read: false,
        type: 'info'
      },
      {
        id: '3',
        title: 'Échéance de remboursement',
        message: 'Rappel: Vous avez une échéance de remboursement prévue pour demain',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        type: 'warning'
      }
    ]);
    setIsLoading(false);
  }, []);
  
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm">
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
            <p className="text-gray-500 text-sm">Vos alertes et messages récents</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-[#0D6A51] border-t-transparent rounded-full"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Aucune notification</h3>
            <p className="mt-2 text-sm text-gray-500">
              Vous n'avez pas encore reçu de notifications.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`bg-white rounded-lg shadow p-4 ${!notification.read ? 'border-l-4 border-[#0D6A51]' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-medium ${!notification.read ? 'text-[#0D6A51]' : ''}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="bg-[#0D6A51] h-2 w-2 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileNotificationsPage;
