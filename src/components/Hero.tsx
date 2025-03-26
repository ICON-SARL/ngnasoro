
import React from 'react';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 flex items-center">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#f8fafc] dark:bg-gray-950"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-blue-100/30 dark:bg-blue-900/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] rounded-full bg-blue-50/30 dark:bg-blue-950/10 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary animate-fade-in">
              Secure Scalable Architecture
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight md:leading-tight tracking-tight animate-fade-up animate-delay-100">
              Enterprise-Grade <br />
              <span className="gradient-blue-text">Secure Architecture</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 animate-fade-up animate-delay-200">
              A scalable framework for secure web and mobile applications with dedicated microservices, isolated databases, and advanced encryption.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4 animate-fade-up animate-delay-300">
              <button className="h-12 px-8 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-all transform hover:translate-y-[-2px]">
                Learn More
              </button>
              <button className="h-12 px-8 rounded-md border border-input bg-background text-foreground font-medium hover:bg-muted transition-all">
                View Demo
              </button>
            </div>
            
            <div className="pt-6 flex items-center justify-center md:justify-start space-x-8 animate-fade-up animate-delay-400">
              <div className="flex flex-col items-center md:items-start">
                <div className="text-sm text-muted-foreground">PCI DSS</div>
                <div className="text-sm font-medium">Compliant</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col items-center md:items-start">
                <div className="text-sm text-muted-foreground">GDPR</div>
                <div className="text-sm font-medium">Compliant</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col items-center md:items-start">
                <div className="text-sm text-muted-foreground">AES-256</div>
                <div className="text-sm font-medium">Encryption</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md mx-auto relative animate-scale-in animate-delay-200">
            <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-grid-gray-100/[0.1] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
                  <div className="p-4 relative space-y-4 w-full">
                    <div className="flex justify-center">
                      <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="10" width="40" height="40" rx="4" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="2"/>
                        <text x="30" y="35" textAnchor="middle" fill="#0EA5E9" fontWeight="500" fontSize="12">SFDAuth</text>
                        
                        <rect x="70" y="10" width="40" height="40" rx="4" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="2"/>
                        <text x="90" y="35" textAnchor="middle" fill="#0EA5E9" fontWeight="500" fontSize="12">SFDTrans</text>
                        
                        <rect x="130" y="10" width="40" height="40" rx="4" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="2"/>
                        <text x="150" y="35" textAnchor="middle" fill="#0EA5E9" fontWeight="500" fontSize="12">SFDAnalyt</text>
                        
                        <rect x="40" y="70" width="100" height="20" rx="4" fill="#F0F9FF" stroke="#0EA5E9" strokeWidth="2"/>
                        <text x="90" y="83" textAnchor="middle" fill="#0EA5E9" fontWeight="500" fontSize="10">API Gateway</text>
                        
                        <path d="M30 50 L30 60 L90 60 L90 70" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 2"/>
                        <path d="M90 50 L90 70" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 2"/>
                        <path d="M150 50 L150 60 L90 60" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 2"/>
                      </svg>
                    </div>
                    <div className="flex justify-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500 opacity-75 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-blue-500 opacity-75 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-3 h-3 rounded-full bg-blue-500 opacity-75 animate-pulse" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 blur-2xl opacity-50 rounded-full transform scale-150"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
