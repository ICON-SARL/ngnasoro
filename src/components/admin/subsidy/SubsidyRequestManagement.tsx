
import React, { useState } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { Button } from '@/components/ui/button';
import { FilePlus, Filter, Plus } from 'lucide-react';
import { SubsidyRequestCreate } from './request-create';
import { SubsidyRequestsList } from './SubsidyRequestsList';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SubsidyRequestManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { subsidyRequests, isLoading, refetch } = useSubsidyRequests();
  const [activeTab, setActiveTab] = useState('all');

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
  };

  // Filter requests by status based on the active tab
  const filteredRequests = subsidyRequests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return request.status === 'pending' || request.status === 'under_review';
    return request.status === activeTab;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle demande
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>
      
      <Card className="bg-white p-4 rounded-md">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <div className="border-b mb-4">
            <TabsList className="w-full flex justify-start h-10 bg-transparent pb-0 space-x-4">
              <TabsTrigger 
                value="all" 
                className="h-10 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#0D6A51] data-[state=active]:text-[#0D6A51] rounded-none data-[state=active]:shadow-none"
              >
                Toutes
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="h-10 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#0D6A51] data-[state=active]:text-[#0D6A51] rounded-none data-[state=active]:shadow-none"
              >
                En attente
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="h-10 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#0D6A51] data-[state=active]:text-[#0D6A51] rounded-none data-[state=active]:shadow-none"
              >
                Approuvées
              </TabsTrigger>
              <TabsTrigger 
                value="rejected" 
                className="h-10 px-4 data-[state=active]:border-b-2 data-[state=active]:border-[#0D6A51] data-[state=active]:text-[#0D6A51] rounded-none data-[state=active]:shadow-none"
              >
                Rejetées
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <SubsidyRequestsList 
              isLoading={isLoading} 
              showFilters={showFilters}
              onRefresh={refetch}
              onSelectRequest={() => {}} // Adding required prop
            />
          </TabsContent>
        </Tabs>
      </Card>

      <SubsidyRequestCreate 
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
