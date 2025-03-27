
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { SubsidyRequestsList } from './SubsidyRequestsList';
import { SubsidyRequestDetail } from './SubsidyRequestDetail';
import { SubsidyAlertSettings } from './SubsidyAlertSettings';
import { SubsidyRequestCreate } from './SubsidyRequestCreate';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { SubsidyRequestFilter } from '@/types/subsidyRequests';

export function SubsidyRequestManagement() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SubsidyRequestFilter>({
    status: 'pending'
  });
  
  const { 
    subsidyRequests, 
    isLoading,
    alertThresholds,
    isLoadingThresholds
  } = useSubsidyRequests(filters);
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedRequestId(null);
    
    if (tab === 'pending') {
      setFilters({ status: 'pending' });
    } else if (tab === 'under_review') {
      setFilters({ status: 'under_review' });
    } else if (tab === 'approved') {
      setFilters({ status: 'approved' });
    } else if (tab === 'rejected') {
      setFilters({ status: 'rejected' });
    } else if (tab === 'alerts') {
      setFilters({ alertTriggered: true });
    } else if (tab === 'all') {
      setFilters({});
    }
  };
  
  // Count pending requests with high or urgent priority
  const highPriorityCount = subsidyRequests.filter(
    req => req.status === 'pending' && (req.priority === 'high' || req.priority === 'urgent')
  ).length;
  
  // Count alerts
  const alertsCount = subsidyRequests.filter(req => req.alert_triggered).length;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Demandes de Subventions</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les demandes de subvention des SFDs
        </p>
      </div>
      
      {selectedRequestId ? (
        <SubsidyRequestDetail 
          requestId={selectedRequestId} 
          onBack={() => setSelectedRequestId(null)} 
        />
      ) : (
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="relative">
              En attente
              {subsidyRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0D6A51] text-[10px] text-white">
                  {subsidyRequests.filter(req => req.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="under_review">
              En cours d'examen
            </TabsTrigger>
            
            <TabsTrigger value="approved">
              Approuvées
            </TabsTrigger>
            
            <TabsTrigger value="rejected">
              Rejetées
            </TabsTrigger>
            
            <TabsTrigger value="alerts" className="relative">
              Alertes
              {alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {alertsCount}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="all">
              Toutes
            </TabsTrigger>
            
            <TabsTrigger value="settings">
              Paramètres d'alerte
            </TabsTrigger>
            
            <TabsTrigger value="create">
              Nouvelle demande
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Demandes en attente</span>
                  {highPriorityCount > 0 && (
                    <span className="text-sm font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                      {highPriorityCount} demande{highPriorityCount > 1 ? 's' : ''} haute priorité
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Demandes de subvention en attente d'examen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubsidyRequestsList 
                  requests={subsidyRequests}
                  isLoading={isLoading}
                  onSelectRequest={setSelectedRequestId}
                  defaultSortBy="priority"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="under_review">
            <Card>
              <CardHeader>
                <CardTitle>Demandes en cours d'examen</CardTitle>
                <CardDescription>
                  Demandes de subvention actuellement en cours d'examen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubsidyRequestsList 
                  requests={subsidyRequests}
                  isLoading={isLoading}
                  onSelectRequest={setSelectedRequestId}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Demandes approuvées</CardTitle>
                <CardDescription>
                  Demandes de subvention qui ont été approuvées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubsidyRequestsList 
                  requests={subsidyRequests}
                  isLoading={isLoading}
                  onSelectRequest={setSelectedRequestId}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Demandes rejetées</CardTitle>
                <CardDescription>
                  Demandes de subvention qui ont été rejetées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubsidyRequestsList 
                  requests={subsidyRequests}
                  isLoading={isLoading}
                  onSelectRequest={setSelectedRequestId}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Demandes avec alertes</CardTitle>
                <CardDescription>
                  Demandes de subvention qui ont déclenché des alertes de seuil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubsidyRequestsList 
                  requests={subsidyRequests}
                  isLoading={isLoading}
                  onSelectRequest={setSelectedRequestId}
                  isAlertView
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les demandes</CardTitle>
                <CardDescription>
                  Liste complète de toutes les demandes de subvention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubsidyRequestsList 
                  requests={subsidyRequests}
                  isLoading={isLoading}
                  onSelectRequest={setSelectedRequestId}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <SubsidyAlertSettings 
              thresholds={alertThresholds}
              isLoading={isLoadingThresholds}
            />
          </TabsContent>
          
          <TabsContent value="create">
            <SubsidyRequestCreate
              onSuccess={() => {
                setActiveTab('pending');
                handleTabChange('pending');
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
