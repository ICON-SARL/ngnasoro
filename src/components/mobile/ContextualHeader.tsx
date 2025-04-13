
import React from 'react';
import { Menu } from 'lucide-react';

const ContextualHeader = () => {
  return (
    <div className="bg-[#0D6A51] h-16 flex items-center justify-between px-4 rounded-b-2xl">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
          <img 
            src="/lovable-uploads/5bea06b7-84d8-474a-8a27-40711aff2092.png" 
            alt="N'GNA SÔRÔ! Logo" 
            className="h-8 w-8 object-contain"
          />
        </div>
        <div>
          <h1 className="text-white text-lg font-bold">
            N'GNA <span className="text-[#F97316]">SÔRÔ!</span>
          </h1>
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
