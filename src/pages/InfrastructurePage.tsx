
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import InfrastructureMonitoring from '@/components/InfrastructureMonitoring';
import { ApiIntegration } from '@/components/ApiIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Server2, Settings, Cloud, GitBranch } from 'lucide-react';

const InfrastructurePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Infrastructure Cloud</h1>
          <p className="text-muted-foreground">Gestion des clusters Kubernetes, CI/CD et monitoring</p>
        </div>
        
        <Tabs defaultValue="kubernetes" className="mb-8">
          <TabsList className="mb-4 bg-white">
            <TabsTrigger value="kubernetes">
              <Server className="h-4 w-4 mr-2" />
              Kubernetes
            </TabsTrigger>
            <TabsTrigger value="cicd">
              <GitBranch className="h-4 w-4 mr-2" />
              CI/CD GitOps
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              <Settings className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Cloud className="h-4 w-4 mr-2" />
              Intégrations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="kubernetes" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <InfrastructureMonitoring />
          </TabsContent>
          
          <TabsContent value="cicd" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="text-center py-10">
              <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">CI/CD GitOps avec ArgoCD</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Ce module permet la configuration et le suivi des pipelines CI/CD basés sur GitOps
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="monitoring" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="text-center py-10">
              <Settings className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">ELK Stack & Prometheus</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Configuration et visualisation des métriques de performance et logs système
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <ApiIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InfrastructurePage;
