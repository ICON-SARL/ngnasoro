
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { FileText, Users, Settings, Database, Workflow, Link, UserCog } from 'lucide-react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { LoanWorkflow } from '@/components/LoanWorkflow';
import { ApiIntegration } from '@/components/ApiIntegration';
import { UserManagement } from '@/components/UserManagement';
import { DataExport } from '@/components/DataExport';

const AgencyDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tableau de Bord Agence SFD</h1>
          <p className="text-muted-foreground">Gestion des services financiers décentralisés</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Prêts actifs</p>
                <h3 className="text-2xl font-semibold">128</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Clients</p>
                <h3 className="text-2xl font-semibold">1,567</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Taux de rembours.</p>
                <h3 className="text-2xl font-semibold">92%</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                <Settings className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Collaborateurs</p>
                <h3 className="text-2xl font-semibold">23</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                <UserCog className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="loans" className="mb-8">
          <TabsList className="mb-4 bg-white">
            <TabsTrigger value="loans" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <Workflow className="h-4 w-4 mr-2" />
              Workflow de Prêts
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <Link className="h-4 w-4 mr-2" />
              API Bancaires
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <UserCog className="h-4 w-4 mr-2" />
              Collaborateurs
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <Database className="h-4 w-4 mr-2" />
              Export Données
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="loans" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <LoanWorkflow />
          </TabsContent>
          
          <TabsContent value="api" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <ApiIntegration />
          </TabsContent>
          
          <TabsContent value="users" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="export" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <DataExport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgencyDashboard;
