
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { BellRing, File, Users, AlertTriangle, MonitorSmartphone, BarChart, UserCog, Database, MessageCircle, Server, CreditCard, BadgeDollarSign } from 'lucide-react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { AgencyOnboarding } from '@/components/AgencyOnboarding';
import { TransactionMonitoring } from '@/components/TransactionMonitoring';
import { ReportGenerator } from '@/components/ReportGenerator';
import { FraudAlerts } from '@/components/FraudAlerts';
import { Link } from 'react-router-dom';
import SupportSystem from '@/components/SupportSystem';
import InfrastructureMonitoring from '@/components/InfrastructureMonitoring';

const SuperAdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tableau de Bord MEREF</h1>
          <p className="text-muted-foreground">Gestion des subventions et supervision des institutions de microfinance (SFDs)</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">SFDs subventionnées</p>
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
                <p className="text-muted-foreground text-sm">Subventions (M FCFA)</p>
                <h3 className="text-2xl font-semibold">750</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mb-4">
          <Link to="/solvency-engine">
            <Button variant="outline" className="gap-2">
              <BarChart className="h-4 w-4" />
              Analyse de Solvabilité
            </Button>
          </Link>
          <Link to="/loan-system">
            <Button className="gap-2 bg-[#0D6A51] hover:bg-[#0D6A51]/90">
              <CreditCard className="h-4 w-4" />
              Système de Subventions
            </Button>
          </Link>
        </div>
        
        <Tabs defaultValue="agencies" className="mb-8">
          <TabsList className="mb-4 bg-white">
            <TabsTrigger value="agencies" className="data-[state=active]:bg-[#FFAB2E]/10 data-[state=active]:text-[#FFAB2E]">
              <Users className="h-4 w-4 mr-2" />
              SFDs
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
            <TabsTrigger value="support" className="data-[state=active]:bg-[#FFAB2E]/10 data-[state=active]:text-[#FFAB2E]">
              <MessageCircle className="h-4 w-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="data-[state=active]:bg-[#FFAB2E]/10 data-[state=active]:text-[#FFAB2E]">
              <Server className="h-4 w-4 mr-2" />
              Infrastructure
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
          
          <TabsContent value="support" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Système de Support</h2>
              <Link to="/support">
                <Button>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Plateforme de support
                </Button>
              </Link>
            </div>
            <SupportSystem />
          </TabsContent>
          
          <TabsContent value="infrastructure" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Infrastructure Cloud</h2>
              <Button>
                <Server className="h-4 w-4 mr-2" />
                Configurer
              </Button>
            </div>
            <InfrastructureMonitoring />
          </TabsContent>
        </Tabs>
        
        <div className="bg-[#0D6A51]/5 border border-[#0D6A51]/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#FFAB2E]/20 flex items-center justify-center text-[#FFAB2E] flex-shrink-0">
              <BadgeDollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-[#0D6A51]">Mécanisme de Refinancement et de Garantie</h3>
              <p className="text-sm text-gray-600 mt-1">
                Le MEREF est une initiative développée par le Gouvernement du Mali et le Fonds International de Développement Agricole (FIDA), 
                à la suite du Programme Microfinance Rural (PMR). La plateforme N'GNA SÔRÔ! permet au MEREF de subventionner des institutions 
                de microfinance (SFDs) afin que celles-ci octroient des prêts aux bénéficiaires via le système.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
