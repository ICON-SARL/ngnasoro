
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileHeader = () => {
  return (
    <div className="bg-white">
      <div className="bg-[#0D6A51] px-4 py-3 rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <img 
                alt="N'GNA SÔRÔ! Logo" 
                src="/lovable-uploads/90c4efc4-a4a5-4961-a8b7-e5ee8eab2649.png" 
                className="h-10 w-10 object-contain" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                N'GNA <span className="text-[#fcb040]">SÔRÔ!</span>
              </h1>
              <p className="text-xs text-white/80">Votre assistant financier</p>
            </div>
          </div>
          
          <Button 
            className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
