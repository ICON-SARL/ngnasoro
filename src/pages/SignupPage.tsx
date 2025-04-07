
import React from 'react';
import Header from '@/components/Header';

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Inscription</h1>
          <p className="text-center text-gray-600 mb-6">
            Fonctionnalité en cours de développement.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;
