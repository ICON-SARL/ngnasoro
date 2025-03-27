
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminAccountsManager } from './roles/AdminAccountsManager';
import { AdminRoleManager } from './roles/AdminRoleManager';
import { useAdminManagement } from './hooks/useAdminManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, LucideIcon, Check, UserCog, Settings } from 'lucide-react';

interface RoleDescriptionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  permissions: string[];
  color: string;
}

function RoleDescriptionCard({ icon: Icon, title, description, permissions, color }: RoleDescriptionCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start mb-4">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="space-y-2">
          {permissions.map((perm, i) => (
            <div key={i} className="flex items-center text-sm">
              <Check className="h-3.5 w-3.5 mr-2 text-green-600" />
              {perm}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminManagement() {
  const [activeTab, setActiveTab] = useState('accounts');
  const adminManagement = useAdminManagement();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gestion des Administrateurs</h1>
        <p className="text-sm text-muted-foreground">
          Créez et gérez les comptes administrateurs et leurs rôles
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <RoleDescriptionCard 
          icon={Shield}
          title="Super Admin"
          description="Accès complet au système"
          permissions={["Gestion complète du système", "Création/Modification des rôles", "Audit complet"]}
          color="bg-purple-100 text-purple-700"
        />
        
        <RoleDescriptionCard 
          icon={UserCog}
          title="Administrateur SFD"
          description="Gestion des SFDs assignées"
          permissions={["Gestion des SFDs assignées", "Approbation des subventions", "Gestion des utilisateurs SFD"]}
          color="bg-blue-100 text-blue-700"
        />
        
        <RoleDescriptionCard 
          icon={Settings}
          title="Auditeur"
          description="Accès en lecture seule"
          permissions={["Consultation des journaux d'audit", "Visualisation des statistiques", "Accès aux rapports"]}
          color="bg-amber-100 text-amber-700"
        />
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="roles">Rôles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts">
          <AdminAccountsManager />
        </TabsContent>
        
        <TabsContent value="roles">
          <AdminRoleManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminManagement;
