
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { CreditCard } from 'lucide-react';

const UserHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-[#0D6A51]">
          <img src="/lovable-uploads/0497e073-9224-4a14-8851-577db02c0e57.png" alt="User" />
        </Avatar>
        <div>
          <p className="text-sm text-gray-600">Bonjour, Amadou</p>
          <p className="text-xs text-gray-500">Bienvenue</p>
        </div>
      </div>
      <div className="flex items-center">
        <CreditCard className="h-6 w-6 text-[#0D6A51]" />
      </div>
    </div>
  );
};

export default UserHeader;
