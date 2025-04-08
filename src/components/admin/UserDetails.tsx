
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSfdAssociations } from './UserSfdAssociations';
import { Badge } from '@/components/ui/badge';
import { UserIcon, Mail, Calendar, Shield } from 'lucide-react';

interface UserDetailsProps {
  userId: string;
  userData?: any;
}

export function UserDetails({ userId, userData }: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  
  if (!userId) {
    return (
      <div className="p-4 text-center bg-muted/30 rounded-lg">
        <UserIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">Sélectionnez un utilisateur pour voir les détails</p>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Chargement des détails de l'utilisateur...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{userData.full_name || 'Utilisateur'}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 mr-1" />
                  {userData.email}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant={userData.app_metadata?.role === 'admin' ? 'destructive' : userData.app_metadata?.role === 'sfd_admin' ? 'default' : 'secondary'}>
                    <Shield className="h-3 w-3 mr-1" />
                    {userData.app_metadata?.role === 'admin' 
                      ? 'Admin' 
                      : userData.app_metadata?.role === 'sfd_admin'
                      ? 'Admin SFD'
                      : 'Utilisateur'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              ID: {userId}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="sfds">SFDs</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Profile details would go here */}
              <p>Les informations du profil de l'utilisateur seraient affichées ici.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sfds" className="mt-4">
          <UserSfdAssociations 
            userId={userId}
            userName={userData.full_name || userData.email} 
          />
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Security settings would go here */}
              <p>Les paramètres de sécurité de l'utilisateur seraient affichés ici.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
