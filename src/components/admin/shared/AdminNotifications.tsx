
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

export function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    hasError 
  } = useAdminCommunication();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);
  
  // Refresh notifications when popover is opened
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);
  
  const handleNotificationClick = async (notificationId: string, actionLink?: string) => {
    await markAsRead(notificationId);
    setOpen(false);
    if (actionLink) {
      navigate(actionLink);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllAsRead(user.id);
    }
  };
  
  // Render notification icon based on type
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadCount <= 99 ? unreadCount : '99+'}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs flex gap-1"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3" />
              <span>Tout marquer comme lu</span>
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {hasError ? (
            <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
              <XCircle className="h-8 w-8 mb-2" />
              <p>Impossible de charger les notifications</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => fetchNotifications()}
              >
                Réessayer
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <BellOff className="h-8 w-8 mb-2" />
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id || index}>
                {index > 0 && <Separator />}
                <div 
                  className={`p-4 cursor-pointer ${!notification.read ? 'bg-accent/30' : ''}`}
                  onClick={() => notification.id && handleNotificationClick(notification.id, notification.action_link)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {renderNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.created_at ? new Date(notification.created_at).toLocaleDateString('fr-ML', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
