
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useClientLoans } from '@/hooks/useClientLoans';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const NotificationItem = ({ notification, markAsRead }: { notification: any, markAsRead: (id: string) => void }) => {
  const [isRead, setIsRead] = useState(notification.read);
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr });
  
  const handleMarkAsRead = async () => {
    if (!isRead) {
      await markAsRead(notification.id);
      setIsRead(true);
    }
  };
  
  return (
    <div className={`p-4 rounded-md border ${isRead ? 'bg-muted' : 'bg-card'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notification.type.includes('loan_approved') && <CheckCircle className="h-5 w-5 text-green-500" />}
          {notification.type.includes('loan_rejected') && <AlertCircle className="h-5 w-5 text-red-500" />}
          {notification.type.includes('loan_disbursed') && <Bell className="h-5 w-5 text-blue-500" />}
          
          <div>
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
        </div>
        
        <div>
          {!isRead && (
            <Button variant="outline" size="sm" onClick={handleMarkAsRead}>
              Marquer comme lu
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
        {notification.action_link && (
          <Button variant="link" size="sm" asChild>
            <Link to={notification.action_link} onClick={handleMarkAsRead}>
              Voir plus <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

const ClientNotifications = () => {
  const { notifications = [], notificationsLoading, markNotificationAsRead, refetchNotifications } = useClientLoans();
  
  const unreadNotifications = notifications.filter(notification => !notification.read);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Suivez les mises à jour et notifications concernant vos prêts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="unread">
              Non lues
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune notification</h3>
                <p className="text-muted-foreground mb-6">
                  Vous n'avez pas encore reçu de notifications.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/loans">Voir mes prêts</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    markAsRead={markNotificationAsRead.mutate} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unread" className="mt-6">
            {unreadNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune notification non lue</h3>
                <p className="text-muted-foreground mb-6">
                  Toutes vos notifications ont été lues.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/loans">Voir mes prêts</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {unreadNotifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    markAsRead={markNotificationAsRead.mutate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClientNotifications;
