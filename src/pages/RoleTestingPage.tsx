
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { RoleTestingPanel } from '@/components/admin/RoleTestingPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Users } from 'lucide-react';

const RoleTestingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="grid gap-6">
          <h1 className="text-2xl font-bold">Test des Rôles et Permissions</h1>
          
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-500" />
                  Super Admin (MEREF)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-700">
                  Gestion des SFD, validation des demandes de fonds, rapports, infrastructure à clé publique (PKI).
                </CardDescription>
                <div className="mt-3 text-xs font-medium text-gray-500">
                  Permissions clés :
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    validate_sfd_funds
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    manage_sfds
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    pki_management
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Admin SFD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-700">
                  Création/validation de comptes clients, gestion des adhésions, gestion des prêts et de l'épargne.
                </CardDescription>
                <div className="mt-3 text-xs font-medium text-gray-500">
                  Permissions clés :
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    create_client_accounts
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    approve_client_adhesion
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    manage_sfd_loans
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-500" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-700">
                  Demande d'adhésion, dépôt/retrait d'épargne, demande de prêt, remboursement de prêt.
                </CardDescription>
                <div className="mt-3 text-xs font-medium text-gray-500">
                  Permissions clés :
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    request_adhesion
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    withdraw_savings
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    repay_loan
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <RoleTestingPanel />
        </div>
      </div>
    </div>
  );
};

export default RoleTestingPage;
