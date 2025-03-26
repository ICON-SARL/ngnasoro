
import React from 'react';
import KYCModule from '@/components/KYCModule';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import LanguageSelector from '@/components/LanguageSelector';
import VocalChatbot from '@/components/VocalChatbot';

const KYCVerification = () => {
  return (
    <LocalizationProvider>
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto py-3 px-4 flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
                alt="NGNA SÔRÔ! Logo" 
                className="h-10"
              />
              <div className="ml-2">
                <h1 className="text-xl font-semibold">
                  <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
                </h1>
                <p className="text-xs text-[#0D6A51]">MEREF - SFD</p>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </header>

        <main className="container mx-auto py-4">
          <KYCModule />
          
          <div className="max-w-md mx-auto mt-8">
            <h2 className="text-xl font-semibold mb-4">Assistant Vocal</h2>
            <VocalChatbot />
          </div>
        </main>
      </div>
    </LocalizationProvider>
  );
};

export default KYCVerification;
