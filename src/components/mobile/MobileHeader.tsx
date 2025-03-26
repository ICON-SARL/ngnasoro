
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Settings } from 'lucide-react';

const MobileHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Avatar className="h-10 w-10 border-2 border-white">
        <img src="/lovable-uploads/0497e073-9224-4a14-8851-577db02c0e57.png" alt="User" />
      </Avatar>
      <Avatar className="h-10 w-10 bg-gray-800 border-2 border-gray-700">
        <Settings className="h-5 w-5 text-white" />
      </Avatar>
    </div>
  );
};

export default MobileHeader;
