
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, BellRing, Shield } from 'lucide-react';

const SfdSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Card className="p-6">
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <BellRing className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <p className="text-gray-500">Configure general agency settings here.</p>
            </TabsContent>
            
            <TabsContent value="users">
              <h3 className="text-lg font-medium mb-4">User Management</h3>
              <p className="text-gray-500">Manage users and permissions.</p>
            </TabsContent>
            
            <TabsContent value="notifications">
              <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
              <p className="text-gray-500">Configure notification preferences.</p>
            </TabsContent>
            
            <TabsContent value="security">
              <h3 className="text-lg font-medium mb-4">Security Settings</h3>
              <p className="text-gray-500">Manage security settings and authentication options.</p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default SfdSettingsPage;
