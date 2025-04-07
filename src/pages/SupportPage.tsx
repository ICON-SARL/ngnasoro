
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SupportSystem } from '@/components/SupportSystem';

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Système de Support</h1>
          <p className="text-muted-foreground">Gestion des tickets, chat vidéo et diagnostics système</p>
        </div>
        
        <SupportSystem />
      </div>
    </div>
  );
};

export default SupportPage;
