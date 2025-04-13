
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <p className="text-gray-600">Aucune SFD disponible pour le moment.</p>
      <p className="text-sm text-gray-500 mt-1">
        Toutes les SFDs sont déjà associées à votre compte ou en attente de validation.
      </p>
    </div>
  );
};

export default EmptyState;
