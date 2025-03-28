
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle, XCircle, AlertCircle, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { mobileApi } from '@/utils/mobileApi';

interface Notification {
  id: string;
  type: 'loan_application' | 'loan_approved' | 'loan_rejected' | 'loan_disbursed' | 'payment_confirmation' | 'loan_status_update';
  title: string;
  message: string;
  timestamp: string;
  loan_id?: string;
  read: boolean;
  sfd_name?: string;
  amount?: number;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  switch (type) {
    case 'loan_application':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'loan_approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'loan_rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'loan_disbursed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'payment_confirmation':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  }
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Dans une application réelle, nous utiliserions l'API pour récupérer les notifications
        // const result = await mobileApi.getNotifications();
        // setNotifications(result || []);
        
        // Données d'exemple pour la démonstration
        setTimeout(() => {
          const mockNotifications: Notification[] = [
            {
              id: '1',
              type: 'loan_application',
              title: 'Demande de prêt reçue (250 000 FCFA)',
              message: 'Votre demande a été reçue et est en cours de traitement.',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
              loan_id: 'loan-123',
              read: false,
              sfd_name: 'Microfinance Alpha'
            },
            {
              id: '2',
              type: 'loan_approved',
              title: 'Prêt approuvé !',
              message: 'Votre prêt de 150 000 FCFA a été approuvé. Les fonds seront disponibles sous peu.',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
              loan_id: 'loan-456',
              read: true,
              sfd_name: 'Crédit Rural',
              amount: 150000
            },
            {
              id: '3',
              type: 'loan_rejected',
              title: 'Demande de prêt refusée',
              message: 'Nous regrettons de vous informer que votre demande de prêt a été refusée.',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
              loan_id: 'loan-789',
              read: false,
              sfd_name: 'Finance Solidaire'
            },
            {
              id: '4',
              type: 'loan_disbursed',
              title: 'Décaissement effectué (250 000 FCFA)',
              message: 'Le montant de votre prêt a été versé sur votre compte.',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
              loan_id: 'loan-123',
              read: true,
              sfd_name: 'Microfinance Alpha',
              amount: 250000
            },
            {
              id: '5',
              type: 'payment_confirmation',
              title: 'Paiement enregistré',
              message: 'Votre paiement mensuel de 25 000 FCFA a été reçu. Merci!',
              timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
              loan_id: 'loan-123',
              read: true,
              amount: 25000
            }
          ];
          
          setNotifications(mockNotifications);
          setFilteredNotifications(mockNotifications);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les notifications',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = notifications.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (notification.sfd_name && notification.sfd_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredNotifications(filtered);
    } else {
      setFilteredNotifications(notifications);
    }
  }, [searchTerm, notifications]);

  const markAsRead = (id: string) => {
    // Dans une application réelle, nous appellerions une API pour marquer la notification comme lue
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    
    // Mettre à jour également les notifications filtrées
    setFilteredNotifications(
      filteredNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigation vers la page de détails du prêt si disponible
    if (notification.loan_id) {
      navigate(`/mobile-flow/loan-tracking/${notification.loan_id}`);
    }
  };

  const markAllAsRead = () => {
    // Dans une application réelle, nous appellerions une API pour marquer toutes les notifications comme lues
    const updatedNotifications = notifications.map((notif) => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    setFilteredNotifications(updatedNotifications);
    
    toast({
      title: 'Notifications',
      description: 'Toutes les notifications ont été marquées comme lues',
    });
  };

  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.read).length;
  };

  const handleBack = () => {
    navigate('/mobile-flow/main');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {getUnreadCount() > 0 && (
            <p className="text-sm text-gray-500">{getUnreadCount()} non lue{getUnreadCount() > 1 ? 's' : ''}</p>
          )}
        </div>
        
        {getUnreadCount() > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Tout marquer comme lu
          </Button>
        )}
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Rechercher dans les notifications"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
          <Bell className="h-10 w-10 mb-2" />
          <p>Aucune notification trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50 border-blue-100' : 'bg-white'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${!notification.read ? 'text-blue-800' : ''}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.timestamp)}
                    </span>
                    {notification.sfd_name && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {notification.sfd_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
