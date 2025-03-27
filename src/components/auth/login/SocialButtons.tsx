
import React from 'react';
import { Button } from '@/components/ui/button';

const SocialButtons = () => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300"></span>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-600 font-medium">ou continuer avec</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <Button 
          variant="outline" 
          className="h-14 text-lg font-medium rounded-xl bg-white shadow-md hover:bg-gray-50 border-2 border-gray-200"
          onClick={() => alert('Fonctionnalité en cours de développement')}
        >
          <img src="/lovable-uploads/0497e073-9224-4a14-8851-577db02c0e57.png" alt="Google" className="h-6 w-6 mr-2" />
          Google
        </Button>
      </div>
    </div>
  );
};

export default SocialButtons;
