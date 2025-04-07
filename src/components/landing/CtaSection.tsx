
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/80 text-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Rejoignez le système financier moderne du Mali
          </h2>
          <p className="text-lg opacity-90">
            Créez votre compte, choisissez votre SFD et commencez à utiliser nos services financiers dès aujourd'hui.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/auth')}
              className="h-12 px-10 bg-white text-[#0D6A51] hover:bg-gray-100 rounded-full font-medium text-lg"
            >
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate('/sfd-selector')}
              className="h-12 px-10 bg-transparent border border-white text-white hover:bg-white/10 rounded-full font-medium text-lg"
            >
              Explorer les SFDs
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
