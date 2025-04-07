
import React from 'react';
import { Header } from '@/components/Header';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
        <p>Bienvenue sur votre tableau de bord.</p>
      </main>
    </div>
  );
};

export default DashboardPage;
