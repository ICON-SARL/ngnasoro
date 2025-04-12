
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Activity, Clock } from 'lucide-react';
import { RoleAuditSystem } from './RoleAuditSystem';
import { IntegrationTester } from './IntegrationTester';
import { WebhookMonitor } from './WebhookMonitor';

export function SfdManagementContainer() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des SFDs</h1>
      
      <Tabs defaultValue="audit">
        <TabsList className="w-full border-b px-2">
          <TabsTrigger value="audit" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Audit RBAC
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Tests d'Intégration
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Monitoring Webhooks
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit" className="py-4">
          <RoleAuditSystem />
        </TabsContent>
        
        <TabsContent value="integration" className="py-4">
          <IntegrationTester />
        </TabsContent>
        
        <TabsContent value="webhooks" className="py-4">
          <WebhookMonitor />
        </TabsContent>
      </Tabs>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Recommandations techniques</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Transactions SQL atomiques :</strong> Utiliser des transactions SQL pour garantir l'intégrité des données.
              <pre className="bg-gray-50 p-2 rounded mt-1 text-sm font-mono">
                BEGIN;<br/>
                UPDATE sfd_operation SET balance = balance - 100 WHERE sfd_id = 123;<br/>
                UPDATE client_loan SET balance = balance + 100 WHERE client_id = 456;<br/>
                COMMIT;
              </pre>
            </li>
            <li>
              <strong>Verrous optimistes :</strong> Implémenter des mécanismes de versioning pour éviter les conflits de concurrence.
            </li>
            <li>
              <strong>Logs d'audit :</strong> Stocker toutes les tentatives de transaction dans transaction_audit_logs.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
