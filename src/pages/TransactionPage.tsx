
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';

const TransactionPage = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold mb-6">Détails de la transaction</h1>
        <p>ID de transaction: {id}</p>
        <div className="bg-white p-6 rounded-lg shadow mt-4">
          <p className="text-gray-500">Détails en cours de chargement...</p>
        </div>
      </main>
    </div>
  );
};

export default TransactionPage;
