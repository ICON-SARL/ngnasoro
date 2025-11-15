import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trash2, Check, HandCoins, TrendingUp, TrendingDown, 
  CheckCircle, XCircle, UserPlus, AlertCircle, Info, Clock, 
  DollarSign, Bell, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMobileNotifications } from '@/hooks/useMobileNotifications';
import { getNotificationIconName, getNotificationColor } from '@/utils/notificationHelpers';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

// Helper local pour obtenir l'icône React
const getIconComponent = (type: string) => {
  const iconClass = "h-5 w-5";
  const iconName = getNotificationIconName(type);
  
  const iconMap: Record<string, React.ReactNode> = {
    HandCoins: <HandCoins className={`${iconClass} text-primary`} />,
    TrendingUp: <TrendingUp className={`${iconClass} text-success`} />,
    TrendingDown: <TrendingDown className={`${iconClass} text-warning`} />,
    CheckCircle: <CheckCircle className={`${iconClass} text-success`} />,
    XCircle: <XCircle className={`${iconClass} text-destructive`} />,
    Clock: <Clock className={`${iconClass} text-warning`} />,
    UserPlus: <UserPlus className={`${iconClass} text-primary`} />,
    DollarSign: <DollarSign className={`${iconClass} text-success`} />,
    AlertCircle: <AlertCircle className={`${iconClass} text-destructive`} />,
    Wrench: <Wrench className={`${iconClass} text-warning`} />,
    Bell: <Bell className={`${iconClass} text-primary`} />,
    Info: <Info className={`${iconClass} text-primary`} />
  };
  
  return iconMap[iconName] || iconMap.Info;
};

const MobileNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useMobileNotifications();

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.is_read);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
        
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm opacity-90">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead()}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Check className="h-4 w-4 mr-2" />
            Tout marquer
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="px-4 pt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            Toutes ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non lues ({unreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Liste des notifications */}
      <ScrollArea className="h-[calc(100vh-180px)] px-4 py-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Check className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? 'Aucune notification non lue' 
                  : 'Aucune notification'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${getNotificationColor(notification.type)}
                    ${!notification.is_read ? 'shadow-md' : 'opacity-75'}
                    hover:scale-[1.02] active:scale-[0.98]
                  `}
                >
                  <div className="flex gap-3">
                    {/* Icône */}
                    <div className="flex-shrink-0 mt-1">
                      {getIconComponent(notification.type)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight">
                          {notification.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={(e) => handleDelete(e, notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                        
                        {!notification.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};

export default MobileNotificationsPage;
