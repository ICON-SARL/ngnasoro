
import React from 'react';
import { Building, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AvailableChannels: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-medium text-slate-800 mb-4">Canaux disponibles</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden">
          <CardContent className="p-5 flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center bg-[#E5DEFF] rounded-full mb-3">
              <Building className="h-6 w-6 text-indigo-500" />
            </div>
            <p className="text-base font-medium text-slate-800">Agence SFD</p>
            <p className="text-xs text-slate-500">Via QR Code</p>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden">
          <CardContent className="p-5 flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center bg-[#FDE1D3] rounded-full mb-3">
              <Phone className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-base font-medium text-slate-800">Mobile Money</p>
            <p className="text-xs text-slate-500">Orange, MTN, Wave</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvailableChannels;
