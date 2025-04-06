
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const SfdAccountsManager: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>SFD Accounts Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-500">SFD accounts management functionality will be implemented here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdAccountsManager;
