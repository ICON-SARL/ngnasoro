
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { LayoutGrid } from 'lucide-react';

const MobileHeader = () => {
  return (
    <div className="flex flex-col mb-3">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-medium text-white">Hello <span className="font-bold">David,</span></h2>
        </div>
        <Avatar className="h-10 w-10 bg-white/20 border border-white/30 backdrop-blur-sm">
          <LayoutGrid className="h-5 w-5 text-white" />
        </Avatar>
      </div>
    </div>
  );
};

export default MobileHeader;
