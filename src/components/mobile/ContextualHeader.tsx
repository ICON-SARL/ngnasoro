
import React from 'react';
import { Menu } from 'lucide-react';

const ContextualHeader = () => {
  return (
    <div className="bg-[#0D6A51] py-4 px-4 rounded-b-xl flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
          <img 
            src="/lovable-uploads/11c7df4b-bda8-4b49-b653-6ba0e7d3abad.png" 
            alt="N'GNA SÔRÔ! Logo" 
            className="h-8 w-8 object-contain"
          />
        </div>
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">
            N'GNA <span className="text-[#F97316]">SÔRÔ!</span>
          </h1>
          <p className="text-yellow-300 text-xs font-medium">CVECA-ON</p>
        </div>
      </div>
      
      <button className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ContextualHeader;
