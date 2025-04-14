
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { CreditApprovalManager } from '@/components/admin/credit/CreditApprovalManager';
import { Footer } from '@/components';

export default function CreditApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Approbation de Crédit</h1>
          <p className="text-muted-foreground">
            Examiner et approuver les demandes de crédit en attente
          </p>
        </div>
        
        <CreditApprovalManager />
      </main>
      
      <Footer />
    </div>
  );
}
