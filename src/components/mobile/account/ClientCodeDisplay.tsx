
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Shield } from 'lucide-react';

const ClientCodeDisplay = () => {
  const { user } = useAuth();
  
  if (!user?.id) {
    return null;
  }

  // Get client code from user profile metadata
  const clientCode = user?.user_metadata?.client_code || 'Non assigné';
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Identification Client</h3>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            Important
          </Badge>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Votre code d'identification unique est nécessaire pour toutes vos interactions avec la SFD.
        </p>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <code className="font-mono text-base font-semibold">{clientCode}</code>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCodeDisplay;
