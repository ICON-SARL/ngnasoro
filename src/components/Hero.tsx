
import React from 'react';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 flex items-center">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#f8fafc] dark:bg-gray-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-[#0D6A51]/10 dark:bg-[#0D6A51]/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] rounded-full bg-[#FFAB2E]/10 dark:bg-[#FFAB2E]/10 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center rounded-full border border-[#0D6A51]/20 bg-[#0D6A51]/5 px-3 py-1 text-sm font-medium text-[#0D6A51] animate-fade-in">
              Finance Décentralisée au Mali
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight md:leading-tight tracking-tight animate-fade-up animate-delay-100">
              <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl text-gray-700 dark:text-gray-300 mt-2">
                Services financiers pour tous
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 animate-fade-up animate-delay-200">
              Une plateforme multi-SFD donnant accès aux services financiers décentralisés pour les populations rurales et urbaines du Mali.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4 animate-fade-up animate-delay-300">
              <button className="h-12 px-8 rounded-md bg-[#0D6A51] text-white font-medium hover:bg-[#0D6A51]/90 transition-all transform hover:translate-y-[-2px]">
                Commencer
              </button>
              <button className="h-12 px-8 rounded-md border border-[#0D6A51]/20 bg-background text-[#0D6A51] font-medium hover:bg-[#0D6A51]/5 transition-all">
                Démo Mobile
              </button>
            </div>
            
            <div className="pt-6 flex items-center justify-center md:justify-start space-x-8 animate-fade-up animate-delay-400">
              <div className="flex flex-col items-center md:items-start">
                <div className="text-sm text-muted-foreground">SFDs</div>
                <div className="text-xl font-bold text-[#0D6A51]">12+</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col items-center md:items-start">
                <div className="text-sm text-muted-foreground">Utilisateurs</div>
                <div className="text-xl font-bold text-[#0D6A51]">20K+</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col items-center md:items-start">
                <div className="text-sm text-muted-foreground">Régions</div>
                <div className="text-xl font-bold text-[#0D6A51]">8</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md mx-auto relative animate-scale-in animate-delay-200">
            <div className="grid grid-cols-2 gap-4">
              {/* Main feature illustration */}
              <div className="col-span-2">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                  <img 
                    src="/lovable-uploads/89b7efc9-1de2-4e1c-874a-5360b497c86c.png" 
                    alt="Agent SFD avec un client" 
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-medium">Services financiers accessibles</p>
                  </div>
                </div>
              </div>
              
              {/* Secondary illustrations */}
              <div className="rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <img 
                  src="/lovable-uploads/e8357419-009f-4b77-8913-c4e5bceddb72.png" 
                  alt="Application mobile" 
                  className="w-full h-auto object-cover"
                />
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-700">Application mobile</p>
                </div>
              </div>
              
              <div className="rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <img 
                  src="/lovable-uploads/57edf9b1-a247-48e5-bdc0-eeaa3033bfbf.png" 
                  alt="Transfert d'argent" 
                  className="w-full h-auto object-cover"
                />
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-700">Transferts sécurisés</p>
                </div>
              </div>
              
              {/* Badge overlay */}
              <div className="absolute -top-3 -right-3 bg-[#FFAB2E] text-white text-xs px-3 py-1 rounded-full shadow-md">
                Sécurisé
              </div>
            </div>
            
            <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-[#0D6A51]/20 to-[#FFAB2E]/20 blur-2xl opacity-50 rounded-full transform scale-150"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
