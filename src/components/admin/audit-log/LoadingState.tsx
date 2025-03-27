
import React from 'react';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      <p className="mt-4 text-sm text-gray-600">Chargement des données d'audit...</p>
    </div>
  );
}
