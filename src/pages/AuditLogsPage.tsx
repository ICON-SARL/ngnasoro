
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { AuditLogsManager } from '@/components/admin/audit/AuditLogsManager';
import { Footer } from '@/components';

export default function AuditLogsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Journal d'Audit</h1>
          <p className="text-muted-foreground">
            Consulter l'historique des actions effectuées sur la plateforme
          </p>
        </div>
        
        <AuditLogsManager />
      </main>
      
      <Footer />
    </div>
  );
}
