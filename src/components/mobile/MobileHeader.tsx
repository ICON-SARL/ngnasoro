import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import SfdSelector from './SfdSelector';
const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="bg-white">
      <div className="bg-[#0D6A51] px-4 py-4 rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
              <img alt="N'GNA SÔRÔ! Logo" className="h-12 w-12 object-cover" src="/lovable-uploads/90c4efc4-a4a5-4961-a8b7-e5ee8eab2649.png" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                N'GNA <span className="text-[#fcb040]">SÔRÔ!</span>
              </h1>
            </div>
          </div>
          
          <button className="text-white p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* SFD Selector positioned below the logo */}
        <SfdSelector className="mt-2" />
      </div>
    </div>;
};
export default MobileHeader;