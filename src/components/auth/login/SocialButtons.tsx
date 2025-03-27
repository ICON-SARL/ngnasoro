
import React from 'react';
import { Button } from '@/components/ui/button';

const SocialButtons = () => {
  return (
    <div className="space-y-5">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-500 font-medium">Ou connectez-vous avec</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button 
          variant="outline" 
          type="button" 
          className="h-12 rounded-xl border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
            alt="Google" 
            className="h-5 w-5 mr-3" 
          />
          <span className="font-medium">Google</span>
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          className="h-12 rounded-xl border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" 
            alt="Facebook" 
            className="h-5 w-5 mr-3" 
          />
          <span className="font-medium">Facebook</span>
        </Button>
      </div>
    </div>
  );
};

export default SocialButtons;
