
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';

  const handleStart = () => {
    navigate('/mobile-flow');
  };

  return (
    <div className="h-full bg-green-500 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6">
          <img 
            src="/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" 
            alt="RupeeRedee Logo" 
            className="h-20 w-auto mx-auto mb-4" 
          />
          <h1 className="text-4xl font-bold text-white mb-2">RupeeRedee</h1>
        </div>
        
        <div className="relative mb-8">
          <img 
            src="/lovable-uploads/89b7efc9-1de2-4e1c-874a-5360b497c86c.png" 
            alt="Mobile loan app" 
            className="h-64 w-auto object-contain" 
          />
          <img 
            src="/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" 
            alt="Mascot" 
            className="absolute top-0 right-0 h-16 w-16 transform translate-x-6" 
          />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Instant personal loans at your fingertips
        </h2>
        <p className="text-white text-lg mb-8">
          Apply now and get up to ₹25,000 credit line in minutes
        </p>
        
        <Button 
          onClick={handleStart}
          className="w-full bg-white text-green-600 hover:bg-green-50 hover:text-green-700 py-6 rounded-xl font-bold text-lg"
        >
          START <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-6 pb-10">
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="secondary"
            className="bg-blue-600 text-white hover:bg-blue-700 py-4 rounded-xl font-semibold"
          >
            Apply on web <span className="ml-2">💻</span>
          </Button>
          <Button 
            variant="secondary"
            className="bg-blue-600 text-white hover:bg-blue-700 py-4 rounded-xl font-semibold"
          >
            Apply in app <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
