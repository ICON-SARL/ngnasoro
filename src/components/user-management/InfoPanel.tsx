
import React from 'react';
import { Shield } from 'lucide-react';

export const InfoPanel = () => {
  return (
    <div className="border rounded-lg p-4 bg-blue-50">
      <div className="flex items-start">
        <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-800">Contrôle d'Accès Basé sur les Rôles (RBAC)</h3>
          <p className="text-sm text-blue-700 mt-1">
            Le système RBAC permet de définir précisément les permissions accordées à chaque rôle, 
            assurant ainsi que chaque utilisateur n'a accès qu'aux fonctionnalités nécessaires à 
            l'exercice de ses fonctions, conformément aux principes du moindre privilège.
          </p>
        </div>
      </div>
    </div>
  );
};
