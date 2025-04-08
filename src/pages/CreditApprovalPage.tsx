
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { CreditApplicationList } from '@/components/admin/credit/CreditApplicationList';
import { CreditScoringPanel } from '@/components/admin/credit/CreditScoringPanel';

const CreditApprovalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-2">Credit Application Approval</h1>
        <p className="text-gray-500 mb-6">Review and approve credit applications from SFD agencies</p>
        
        <Card className="p-6">
          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Pending Approval
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Rejected
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/3">
                  <CreditApplicationList status="pending" />
                </div>
                <div className="lg:w-1/3">
                  <CreditScoringPanel />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="approved">
              <CreditApplicationList status="approved" />
            </TabsContent>
            
            <TabsContent value="rejected">
              <CreditApplicationList status="rejected" />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CreditApprovalPage;
