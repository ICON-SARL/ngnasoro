
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, FileText, Settings } from 'lucide-react';

const MerefLoanManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">MEREF Loan Management</h1>
        
        <Card className="p-6">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <h2 className="text-xl font-semibold mb-4">Loan Portfolio Overview</h2>
              <p className="text-gray-500">
                This section provides an overview of your MEREF loan portfolio, including active loans, 
                repayment rates, and key metrics.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Total Active Loans</h3>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Disbursed Amount</h3>
                  <p className="text-2xl font-bold">0 FCFA</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Repayment Rate</h3>
                  <p className="text-2xl font-bold">0%</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reports">
              <h2 className="text-xl font-semibold mb-4">Loan Reports</h2>
              <p className="text-gray-500">Generate and view reports related to MEREF loans.</p>
            </TabsContent>
            
            <TabsContent value="settings">
              <h2 className="text-xl font-semibold mb-4">Loan Settings</h2>
              <p className="text-gray-500">Configure loan settings and parameters.</p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default MerefLoanManagementPage;
