
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Skeleton } from '@/components/ui/skeleton';

const NotificationsSection = () => {
  const { settings, loading, updateSetting } = useUserSettings();

  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Notifications</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-xs text-gray-500">
                  Recevez des alertes et mises à jour
                </p>
              </div>
            </div>
            <Switch 
              checked={settings?.push_notifications_enabled ?? false}
              onCheckedChange={(value) => 
                updateSetting('push_notifications_enabled', value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Notifications email</p>
                <p className="text-xs text-gray-500">
                  Recevez des récapitulatifs par email
                </p>
              </div>
            </div>
            <Switch 
              checked={settings?.email_notifications_enabled ?? false}
              onCheckedChange={(value) => 
                updateSetting('email_notifications_enabled', value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Notifications SMS</p>
                <p className="text-xs text-gray-500">
                  Recevez des alertes urgentes par SMS
                </p>
              </div>
            </div>
            <Switch 
              checked={settings?.sms_notifications_enabled ?? false}
              onCheckedChange={(value) => 
                updateSetting('sms_notifications_enabled', value)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsSection;
