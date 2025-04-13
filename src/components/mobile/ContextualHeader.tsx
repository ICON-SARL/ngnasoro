
import React from 'react';
import { Menu } from 'lucide-react';

const ContextualHeader = () => {
  return (
    <div className="bg-[#0D6A51] h-16 flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <img 
          src="/lovable-uploads/a87c8ee8-a80d-41ab-9d88-b4f39fe42d93.png" 
          alt="N'GNA SÔRÔ! Logo" 
          className="h-10 w-10 rounded-full"
        />
        <div>
          <h1 className="text-white text-lg font-bold">N'GNA SÔRÔ!</h1>
          <p className="text-yellow-300 text-xs">CVECA-ON</p>
        </div>
      </div>
      
      <button className="text-white">
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ContextualHeader;
