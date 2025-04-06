
import React, { useEffect, useState } from 'react';
import { useAdminCommunication } from '@/hooks/useAdminCommunication';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  BellIcon, 
  XCircle, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  CheckCheck,
  BellOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminNotifications() {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount,
    fetchNotifications, 
    markAsRead,
    markAllAsRead,
    hasError,
    isLoading
  } = useAdminCommunication();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications on component mount or when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user, fetchNotifications]);

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'action_required':
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Format notification date
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notificationId: string, read: boolean, actionLink?: string) => {
    if (!read) {
      await markAsRead(notificationId);
    }
    
    if (actionLink) {
      navigate(actionLink);
    }
    
    setIsOpen(false);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (user?.id) {
      await markAllAsRead(user.id);
    }
  };
  
  // Handle retry fetch
  const handleRetryFetch = () => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && !hasError && (
            <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {hasError && (
            <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 p-0 text-white">
              !
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 bg-muted">
          <div className="font-semibold">Notifications</div>
          {unreadCount > 0 && !hasError && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {hasError && (
            <div className="p-3">
              <Alert variant="destructive" className="bg-red-50">
                <AlertDescription className="flex items-center justify-between">
                  <span>Impossible de charger les notifications</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetryFetch}
                  >
                    Réessayer
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {!hasError && notifications.length === 0 && (
            <div className="py-8 text-center">
              <BellOff className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Aucune notification</p>
            </div>
          )}
          
          {!hasError && notifications.map((notification, index) => (
            <div key={notification.id}>
              <button
                className={`w-full text-left px-3 py-3 hover:bg-muted transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification.id, notification.read, notification.action_link)}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{notification.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{notification.message}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatNotificationDate(notification.created_at)}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
                  )}
                </div>
              </button>
              {index < notifications.length - 1 && <Separator />}
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
