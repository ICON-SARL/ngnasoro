
import React from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import LoanApplicationFlow from '@/components/LoanApplicationFlow';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileFlow = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto pt-4 px-4 pb-2 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
            alt="NGNA SÔRÔ! Logo" 
            className="h-16 mb-1"
          />
          <h1 className="text-xl font-bold text-center">
            <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
          </h1>
          <p className="text-xs text-[#0D6A51] mb-2">MEREF - SFD</p>
        </div>
      </div>
      <LoanApplicationFlow />
      <MobileNavigation />
    </div>
  );
};

export default MobileFlow;
