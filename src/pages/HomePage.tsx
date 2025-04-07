
import React from 'react';
import Header from '@/components/Header';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-6">Bienvenue sur NGNA SÔRÔ!</h1>
        <p className="text-lg mb-4">
          Plateforme de gestion des microcrédits et de subventions pour les systèmes financiers décentralisés.
        </p>
      </main>
    </div>
  );
};

export default HomePage;
