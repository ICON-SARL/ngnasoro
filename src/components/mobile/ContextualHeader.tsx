
import React from 'react';
import { Menu } from 'lucide-react';

const ContextualHeader = () => {
  return (
    <div className="bg-[#0D6A51] h-16 flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
          <img 
            src="/lovable-uploads/7d2b8fd7-d6f7-406f-9b76-920a3056df54.png" 
            alt="N'GNA SÔRÔ! Logo" 
            className="h-8 w-8 object-contain"
          />
        </div>
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
