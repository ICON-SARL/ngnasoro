
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
    navigate('/mobile-flow/home-loan');
  };

  return (
    <div className="h-full bg-blue-600 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="flex items-start justify-end w-full mb-6">
          <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
            <img 
              src="/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" 
              alt="RupeeRedee Mascot" 
              className="h-12 w-12 mr-2" 
            />
            <div className="flex flex-col items-start">
              <p className="text-white text-sm">Hi, {firstName}!</p>
              <p className="text-white/80 text-xs">I've got something special for you!</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 w-full mb-8 shadow-lg">
          <div className="bg-blue-50 rounded-lg px-3 py-1 inline-block mb-2">
            <span className="text-blue-600 text-xs font-medium flex items-center">
              BEST OFFER ONLY TODAY 🔥
            </span>
          </div>
          
          <p className="text-gray-700 text-left text-sm mb-1">Get line of credit up to ↗</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-left">₹ 25,000</h2>
          
          <Button 
            onClick={handleStart}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold"
          >
            GET FIRST LOAN
          </Button>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-600 mb-1 text-left">Online purchase loan</p>
              <h4 className="text-sm font-semibold mb-4 text-left">E-voucher with limit up to ₹25,000</h4>
              <div className="flex justify-end">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-6 w-6 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">Coming soon...</p>
            </div>
            
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-600 mb-1 text-left">POP lending</p>
              <h4 className="text-sm font-semibold mb-4 text-left">Personal loans with personlised interest</h4>
              <div className="flex justify-end">
                <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-6 w-6 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">Coming soon...</p>
            </div>
          </div>
          
          <div className="flex items-center mt-4">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <div className="h-6 w-6 bg-green-400 rounded-full"></div>
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold">Invite friends - get bonus points!</h4>
              <p className="text-xs text-gray-500">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative bottom-0 w-full bg-blue-700 py-6 px-6">
        <div className="flex items-center mb-4">
          <img 
            src="/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" 
            alt="RupeeRedee Logo" 
            className="h-12 w-12 mr-4" 
          />
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white">RupeeRedee</h2>
            <p className="text-white/70 text-sm">Instant personal loans at your fingertips</p>
          </div>
        </div>
        
        <Button 
          onClick={handleStart}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center"
        >
          START <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
