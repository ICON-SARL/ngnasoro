
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-4 text-center py-10">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#0D6A51]" />
        <p>Chargement des informations du compte...</p>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
