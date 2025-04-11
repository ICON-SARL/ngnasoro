
import React from 'react';
import { CreditCard } from 'lucide-react';

const EmptyAccountsState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-gray-100 p-3 rounded-full mb-4">
        <CreditCard className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun compte SFD</h3>
      <p className="text-sm text-gray-600 mb-4">
        Vous n'avez aucun compte SFD associé à votre profil.
      </p>
    </div>
  );
};

export default EmptyAccountsState;
