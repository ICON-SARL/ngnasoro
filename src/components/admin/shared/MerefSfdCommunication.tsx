
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Users } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from './ErrorAlert';
import { useSfdAdminManagement } from '../hooks/sfd-admin/useSfdAdminManagement';

export function MerefSfdCommunication() {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const { sfdAdmins, isLoading, error } = useSfdAdminManagement();
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Logic to send message would go here
    setMessage('');
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          Communication MEREF-SFD
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="recent">Récents</TabsTrigger>
            <TabsTrigger value="sfd">Administrateurs SFD</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="p-4 h-[calc(100%-48px)]">
            <div className="space-y-4 h-[calc(100%-80px)] overflow-y-auto">
              {isLoading ? (
                <div className="py-4 text-center">Chargement des messages...</div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  Aucun message récent
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Textarea 
                placeholder="Écrivez votre message..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="sfd" className="p-4 h-[calc(100%-48px)]">
            <ErrorAlert error={error ? error.toString() : null} />
            
            <div className="space-y-4 h-[calc(100%-80px)] overflow-y-auto">
              {isLoading ? (
                <div className="py-4 text-center">Chargement des administrateurs...</div>
              ) : sfdAdmins && sfdAdmins.length > 0 ? (
                sfdAdmins.map((admin: any) => (
                  <div key={admin.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                    <Avatar>
                      <AvatarFallback>{admin.full_name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{admin.full_name || 'Admin SFD'}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Users className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  Aucun administrateur SFD trouvé
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
