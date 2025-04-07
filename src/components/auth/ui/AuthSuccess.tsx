
import React from 'react';
import { Check } from 'lucide-react';

const AuthSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-3">Connexion réussie!</h1>
        <p className="mt-2 text-gray-600 text-lg">Vous allez être redirigé vers votre espace...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
