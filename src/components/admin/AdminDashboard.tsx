import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  return (
    <div>
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-amber-700 mr-2" />
          <h3 className="font-medium">Accès de test SFD</h3>
        </div>
        <p className="text-sm mt-1 text-amber-800">
          Vous pouvez créer un accès administrateur pour CAURIE-MF à des fins de test.
        </p>
        <div className="mt-2">
          <Link to="/admin/create-sfd-admin" className="text-sm text-amber-700 hover:text-amber-900 font-medium">
            Configurer l'accès CAURIE-MF →
          </Link>
        </div>
      </div>
    </div>
  );
}
