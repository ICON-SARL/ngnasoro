
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Users, Loader2, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useSuperAdminManagement } from '@/hooks/useSuperAdminManagement';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function MerefSfdCommunication() {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const { admins, isLoading, error, refetchAdmins } = useSuperAdminManagement();
  
  // Filter only SFD admins
  const sfdAdmins = admins.filter(admin => admin.role === 'sfd_admin');
  
  useEffect(() => {
    // Log the number of admins loaded for debugging
    console.log(`Loaded ${sfdAdmins.length} SFD admins for communication`);
  }, [sfdAdmins]);
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Logic to send message would go here
    console.log('Sending message:', message);
    setMessage('');
  };
  
  const handleRetry = () => {
    refetchAdmins();
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
              <div className="text-center text-muted-foreground py-10">
                Aucun message récent
              </div>
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
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  Impossible de charger les administrateurs.
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                      <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Réessayer
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4 h-[calc(100%-80px)] overflow-y-auto">
              {isLoading ? (
                <div className="py-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Chargement des administrateurs...
                </div>
              ) : sfdAdmins.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  <Users className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  Aucun administrateur SFD trouvé
                </div>
              ) : (
                sfdAdmins.map((admin) => (
                  <div key={admin.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                    <Avatar>
                      <AvatarFallback>{admin.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{admin.full_name}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
