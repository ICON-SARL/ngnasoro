
import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Wallet, CheckCircle } from 'lucide-react';

const SpecialOffers = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">BEST OFFER ONLY TODAY 🔥</h3>
        <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
          <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-sm mb-1">Get line of credit up to ↗</p>
            <h2 className="text-3xl font-bold mb-2">₹25,000</h2>
          </div>
          <img 
            src="/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" 
            alt="Mascot" 
            className="h-12 w-12" 
          />
        </div>
        
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold">
          GET FIRST LOAN
        </Button>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white p-3 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 mb-1">Online purchase loan</p>
            <h4 className="text-sm font-semibold mb-1">E-voucher with limit up to ₹25,000</h4>
            <div className="flex justify-end">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-6 w-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Coming soon...</p>
          </div>
          
          <div className="bg-white p-3 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 mb-1">POP lending</p>
            <h4 className="text-sm font-semibold mb-1">Personal loans with personlised interest</h4>
            <div className="flex justify-end">
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Wallet className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Coming soon...</p>
          </div>
        </div>
        
        <div className="flex items-center mt-4 mb-2">
          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <div className="h-6 w-6 bg-green-400 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Invite friends - get bonus points!</h4>
            <p className="text-xs text-gray-500">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOffers;
