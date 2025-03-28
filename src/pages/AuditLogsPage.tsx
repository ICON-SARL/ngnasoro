
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailedAuditLogViewer } from '@/components/audit/DetailedAuditLogViewer';
import { useAuth } from '@/hooks/auth';
import { AuditLogCategory } from '@/utils/audit/auditLoggerTypes';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { UserRole } from '@/utils/auth/roleTypes';

const AuditLogsPage = () => {
  const { user } = useAuth();
  const { isSuperAdmin, isSfdAdmin } = usePermissions();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Journal d'Audit</h1>
            <p className="text-muted-foreground">
              Suivez toutes les actions système pour la sécurité et la conformité
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Tous les logs</TabsTrigger>
            <TabsTrigger value="subsidies">Subventions</TabsTrigger>
            <TabsTrigger value="loans">Prêts</TabsTrigger>
            <TabsTrigger value="authentication">Authentification</TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="admin">Actions Administrateur</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="all">
            <DetailedAuditLogViewer 
              title="Journal d'audit complet" 
              description="Toutes les actions système enregistrées"
              pageSize={15}
            />
          </TabsContent>
          
          <TabsContent value="subsidies">
            <DetailedAuditLogViewer 
              title="Journal des subventions" 
              description="Demandes, approbations et utilisations des subventions"
              defaultCategory={AuditLogCategory.SUBSIDY_MANAGEMENT}
              pageSize={10}
            />
          </TabsContent>
          
          <TabsContent value="loans">
            <DetailedAuditLogViewer 
              title="Journal des prêts" 
              description="Création, approbation et remboursement des prêts"
              defaultCategory={AuditLogCategory.LOAN_MANAGEMENT}
              pageSize={10}
            />
          </TabsContent>
          
          <TabsContent value="authentication">
            <DetailedAuditLogViewer 
              title="Journal d'authentification" 
              description="Connexions, déconnexions et tentatives d'accès"
              defaultCategory={AuditLogCategory.AUTHENTICATION}
              pageSize={10}
            />
          </TabsContent>
          
          {isSuperAdmin && (
            <TabsContent value="admin">
              <DetailedAuditLogViewer 
                title="Actions Administrateur" 
                description="Actions effectuées par les administrateurs du système"
                defaultCategory={AuditLogCategory.ADMIN_ACTION}
                pageSize={10}
              />
            </TabsContent>
          )}
        </Tabs>
        
        {isSfdAdmin && !isSuperAdmin && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Activités de mon SFD</CardTitle>
              <CardDescription>
                Journal des actions spécifiques à votre SFD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DetailedAuditLogViewer 
                title="Activités SFD" 
                description="Actions liées à votre SFD uniquement"
                userIdFilter={user?.id}
                showFilters={false}
                pageSize={5}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
