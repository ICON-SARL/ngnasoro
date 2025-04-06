
import React from 'react';

const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <h1 className="text-2xl font-bold text-blue-700 mb-3">Chargement en cours...</h1>
        <p className="mt-2 text-gray-600">Veuillez patienter pendant la vérification de votre session.</p>
      </div>
    </div>
  );
};

export default AuthLoading;
