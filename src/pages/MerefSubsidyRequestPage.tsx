
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { FileText, ListChecks } from 'lucide-react';
import { SubsidyRequestForm } from '@/components/sfd/subsidy/SubsidyRequestForm';
import { SubsidyRequestsList } from '@/components/sfd/subsidy/SubsidyRequestsList';

const MerefSubsidyRequestPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('list');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">MEREF Subsidy Requests</h1>
        
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="list" className="flex items-center">
                <ListChecks className="mr-2 h-4 w-4" />
                My Requests
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                New Request
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <SubsidyRequestsList />
            </TabsContent>
            
            <TabsContent value="create">
              <SubsidyRequestForm onSuccess={() => setActiveTab('list')} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default MerefSubsidyRequestPage;
