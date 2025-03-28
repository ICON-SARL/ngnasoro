
import React from 'react';
import DetailedAuditLogViewer from '@/components/audit/DetailedAuditLogViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const AuditLogsPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Journal d'Audit</h1>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 flex items-center text-lg">
            <Shield className="h-5 w-5 mr-2 text-blue-700" />
            Conformité et Traçabilité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm">
            Le journal d'audit enregistre toutes les actions importantes effectuées dans le système. 
            Ces logs sont essentiels pour la conformité réglementaire, les audits, et la résolution de problèmes. 
            Les informations sont conservées conformément aux politiques de rétention des données.
          </p>
        </CardContent>
      </Card>
      
      <DetailedAuditLogViewer />
    </div>
  );
};

export default AuditLogsPage;
