
import React from 'react';
import { Badge } from '@/components/ui/badge';

const PartnersSection = () => {
  const partnerLogos = [
    { name: "Nyèsigiso", logo: "/lovable-uploads/0497e073-9224-4a14-8851-577db02c0e57.png" },
    { name: "Kafo Jiginew", logo: "/lovable-uploads/2941965d-fd44-4815-bb4a-2c77549e1380.png" },
    { name: "Jemeni", logo: "/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" },
    { name: "MEREF", logo: "/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" },
    { name: "Soro Yiriwaso", logo: "/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" },
  ];

  return (
    <section id="partners" className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 mb-10">
          <Badge className="bg-[#0D6A51]/10 text-[#0D6A51] border-[#0D6A51]/20">
            Nos Partenaires
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            SFDs qui nous font confiance
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Rejoignez le réseau croissant d'institutions financières qui transforment les services financiers au Mali.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mt-10">
          {partnerLogos.map((partner, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
            >
              <img 
                src={partner.logo} 
                alt={`${partner.name} logo`} 
                className="h-12 md:h-16 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-lg text-[#0D6A51] font-semibold">
            Et plus de 7 autres institutions financières à travers le Mali
          </p>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
