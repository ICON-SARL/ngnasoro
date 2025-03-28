
import React, { useState } from 'react';
import { useAdminCommunication, AdminNotification } from '@/hooks/useAdminCommunication';
import { Bell, Check, CheckAll, ChevronDown, ChevronUp, ExternalLink, Info, AlertTriangle, AlertCircle, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AdminNotifications() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useAdminCommunication();
  const [open, setOpen] = useState(false);
  
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(id);
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'action_required': return <FileEdit className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 bg-muted/50">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => markAllAsRead()}
            >
              <CheckAll className="h-3.5 w-3.5 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 text-muted" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="grid divide-y">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onMarkAsRead={handleMarkAsRead}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: AdminNotification;
  onMarkAsRead: (id: string, e: React.MouseEvent) => void;
  onClose: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Format the date
  const formattedDate = format(new Date(notification.created_at), 'dd MMM yyyy', { locale: fr });
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { locale: fr, addSuffix: true });
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const content = (
    <div 
      className={`p-3 cursor-pointer ${notification.read ? '' : 'bg-blue-50/50'}`}
      onClick={toggleExpand}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <h4 className={`text-sm font-medium ${notification.read ? '' : 'text-blue-800'}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={(e) => onMarkAsRead(notification.id, e)}
              >
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
            <span title={formattedDate}>{timeAgo}</span>
            <button 
              onClick={toggleExpand}
              className="flex items-center hover:text-foreground transition-colors"
            >
              {expanded ? (
                <>
                  <span className="mr-1">Réduire</span>
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span className="mr-1">Voir plus</span>
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-2 text-sm pl-6">
          <div className="bg-muted/30 p-2 rounded text-xs">
            {notification.message}
          </div>
          {notification.action_link && (
            <div className="mt-2">
              <Link to={notification.action_link} onClick={onClose}>
                <Button size="sm" variant="secondary" className="w-full h-8 text-xs">
                  Voir les détails
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return content;
}
