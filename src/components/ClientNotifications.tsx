
import React from 'react';
import { Bell, CheckCircle, XCircle, Clock, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useClientLoans } from '@/hooks/useClientLoans';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationType = ({ type }: { type: string }) => {
  if (type.includes('loan_approved')) {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  } else if (type.includes('loan_rejected')) {
    return <XCircle className="h-5 w-5 text-red-500" />;
  } else if (type.includes('loan_payment')) {
    return <FileText className="h-5 w-5 text-blue-500" />;
  } else if (type.includes('loan_') || type.includes('payment_')) {
    return <Info className="h-5 w-5 text-amber-500" />;
  } else {
    return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const ClientNotifications = () => {
  const { notifications, notificationsLoading, markNotificationAsRead } = useClientLoans();
  
  // Sort notifications - unread first, then by date
  const sortedNotifications = [...notifications].sort((a, b) => {
    // First sort by read status
    if (a.read === b.read) {
      // Then by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    // Unread first
    return a.read ? 1 : -1;
  });
  
  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead.mutate(id);
  };
  
  if (notificationsLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Restez informé des mises à jour concernant vos prêts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune notification</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas de notification pour le moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Restez informé des mises à jour concernant vos prêts</CardDescription>
          </div>
          <div className="relative">
            <Bell className="h-5 w-5" />
            {notifications.some(n => !n.read) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedNotifications.map((notification) => {
            const createdAt = new Date(notification.created_at);
            const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: fr });
            
            return (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                    <NotificationType type={notification.type} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{timeAgo}</span>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Marquer comme lu
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {notification.action_link && (
                  <div className="mt-3 pt-3 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      as="a"
                      href={notification.action_link}
                    >
                      Voir les détails
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientNotifications;
