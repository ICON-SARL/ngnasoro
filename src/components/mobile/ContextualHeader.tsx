import React from 'react';
import SfdSelector from './SfdSelector';

const ContextualHeader = () => {
  return (
    <div className="bg-[#0D6A51] py-4 px-4 rounded-b-2xl shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
              <img 
                src="/lovable-uploads/11c7df4b-bda8-4b49-b653-6ba0e7d3abad.png" 
                alt="N'GNA SÔRÔ! Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                N'GNA <span className="text-[#F97316]">SÔRÔ!</span>
              </h1>
            </div>
          </div>
          
          <SfdSelector className="mt-2" />
        </div>
      </div>
    </div>
  );
};

export default ContextualHeader;
