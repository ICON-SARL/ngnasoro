
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { BellRing, File, Users, AlertTriangle, MonitorSmartphone, BarChart, UserCog, Database } from 'lucide-react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { AgencyOnboarding } from '@/components/AgencyOnboarding';
import { TransactionMonitoring } from '@/components/TransactionMonitoring';
import { ReportGenerator } from '@/components/ReportGenerator';
import { FraudAlerts } from '@/components/FraudAlerts';

const SuperAdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Gestion centralisée du système de finance décentralisé</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Agences</p>
                <h3 className="text-2xl font-semibold">42</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Transactions (24h)</p>
                <h3 className="text-2xl font-semibold">1,284</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <BarChart className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Prêts actifs</p>
                <h3 className="text-2xl font-semibold">815</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                <File className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Alertes</p>
                <h3 className="text-2xl font-semibold">7</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="agencies" className="mb-8">
          <TabsList className="mb-4 bg-white">
            <TabsTrigger value="agencies" className="data-[state=active]:bg-[#FFAB2E]/10 data-[state=active]:text-[#FFAB2E]">
              <Users className="h-4 w-4 mr-2" />
              Agences
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-[#FFAB2E]/10 data-[state=active]:text-[#FFAB2E]">
              <MonitorSmartphone className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#FFAB2E]/10 data-[state=active]:text-[#FFAB2E]">
              <File className="h-4 w-4 mr-2" />
              Rapports
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-[#FFAB2E]/10 data-[state=active]:text-[#FFAB2E]">
              <BellRing className="h-4 w-4 mr-2" />
              Alertes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="agencies" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <AgencyOnboarding />
          </TabsContent>
          
          <TabsContent value="monitoring" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <TransactionMonitoring />
          </TabsContent>
          
          <TabsContent value="reports" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <ReportGenerator />
          </TabsContent>
          
          <TabsContent value="alerts" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <FraudAlerts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
