
import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function AccessDenied() {
  return (
    <div className="p-6 text-center">
      <ShieldCheck className="h-12 w-12 text-amber-600 mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
      <p className="text-gray-600">
        Vous n'avez pas les permissions nécessaires pour gérer les rôles utilisateurs.
      </p>
    </div>
  );
}
