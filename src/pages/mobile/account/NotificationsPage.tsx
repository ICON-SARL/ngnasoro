
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Bell, 
  Mail, 
  MessageSquare, 
  Volume2, 
  Globe,
  CreditCard,
  FileText,
  Settings,
  Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    preferences, 
    loading, 
    saving,
    updateChannelPreference,
    updateLanguagePreference,
    updateCategoryPreference
  } = useNotificationPreferences();
  
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/account')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Notifications</h1>
      </div>
      
      <div className="p-4 space-y-6">
        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="channels">Canaux</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
          </TabsList>
        
          <TabsContent value="channels" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              {loading ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-10" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-10" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Notifications push</p>
                        <p className="text-xs text-gray-500">
                          Alertes sur votre téléphone
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences?.channels.push} 
                      onCheckedChange={(checked) => updateChannelPreference('push', checked)}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Notifications par e-mail</p>
                        <p className="text-xs text-gray-500">
                          Résumés et confirmations importantes
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences?.channels.email} 
                      onCheckedChange={(checked) => updateChannelPreference('email', checked)}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Notifications par SMS</p>
                        <p className="text-xs text-gray-500">
                          Pour les alertes critiques uniquement
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences?.channels.sms} 
                      onCheckedChange={(checked) => updateChannelPreference('sms', checked)}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <Volume2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Son des notifications</p>
                        <p className="text-xs text-gray-500">
                          Activer les alertes sonores
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences?.channels.sound} 
                      onCheckedChange={(checked) => updateChannelPreference('sound', checked)}
                      disabled={saving}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Globe className="h-5 w-5" />
                </div>
                <p className="font-medium">Langue de l'application</p>
              </div>
              
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <ToggleGroup 
                  type="single" 
                  value={preferences?.language} 
                  onValueChange={(value) => {
                    if (value) updateLanguagePreference(value);
                  }} 
                  className="justify-start"
                  disabled={saving}
                >
                  <ToggleGroupItem value="fr" className="text-sm">Français</ToggleGroupItem>
                  <ToggleGroupItem value="bm" className="text-sm">Bambara</ToggleGroupItem>
                </ToggleGroup>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              {loading ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-10" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-10" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Paiements</p>
                        <p className="text-xs text-gray-500">
                          Paiements effectués et reçus
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences?.categories?.payments} 
                      onCheckedChange={(checked) => updateCategoryPreference('payments', checked)}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Prêts</p>
                        <p className="text-xs text-gray-500">
                          État et informations sur vos prêts
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences?.categories?.loans} 
                      onCheckedChange={(checked) => updateCategoryPreference('loans', checked)}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Système</p>
                        <p className="text-xs text-gray-500">
                          Informations importantes du système
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences?.categories?.system} 
                      onCheckedChange={(checked) => updateCategoryPreference('system', checked)}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Marketing</p>
                        <p className="text-xs text-gray-500">
                          Offres spéciales et promotions
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences?.categories?.marketing} 
                      onCheckedChange={(checked) => updateCategoryPreference('marketing', checked)}
                      disabled={saving}
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;
