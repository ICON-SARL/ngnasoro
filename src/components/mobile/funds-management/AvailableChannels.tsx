
import React from 'react';
import { Building, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AvailableChannels: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border">
        <CardContent className="p-3 flex flex-col items-center">
          <Building className="h-8 w-8 text-[#0D6A51] mb-2" />
          <p className="text-sm font-medium">Agence SFD</p>
          <p className="text-xs text-gray-500">Via QR Code</p>
        </CardContent>
      </Card>
      
      <Card className="border">
        <CardContent className="p-3 flex flex-col items-center">
          <Phone className="h-8 w-8 text-orange-500 mb-2" />
          <p className="text-sm font-medium">Mobile Money</p>
          <p className="text-xs text-gray-500">Orange, MTN, Wave</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailableChannels;
