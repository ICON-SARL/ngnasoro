
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';

interface ClientActivityTabProps {
  clientId: string;
}

export function ClientActivityTab({ clientId }: ClientActivityTabProps) {
  // Here we would typically fetch activity data for the client
  const isLoading = false;
  const activities = [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des activités</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Loader size="md" />
          </div>
        ) : activities.length > 0 ? (
          <ul className="space-y-3">
            {activities.map((activity: any, index) => (
              <li key={index} className="p-3 border rounded-md">
                {/* Activity content would go here */}
                <p>Activité non disponible</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune activité enregistrée pour ce client</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
