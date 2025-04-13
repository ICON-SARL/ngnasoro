
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Banknote, PiggyBank, CreditCard } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center">
      <div 
        className={`flex flex-col items-center ${isActive('/loans') ? 'text-[#0D6A51]' : 'text-gray-500'}`}
        onClick={() => navigate('/mobile-flow/loans')}
      >
        <div className={`p-2 rounded-full ${isActive('/loans') ? 'bg-[#0D6A51]/10' : ''}`}>
          <CreditCard className="h-5 w-5" />
        </div>
        <span className="text-xs mt-1">Prêts</span>
      </div>
      
      <div 
        className={`flex flex-col items-center ${isActive('/my-loans') ? 'text-[#0D6A51]' : 'text-gray-500'}`}
        onClick={() => navigate('/mobile-flow/my-loans')}
      >
        <div className={`p-2 rounded-full ${isActive('/my-loans') ? 'bg-[#0D6A51]/10' : ''}`}>
          <Banknote className="h-5 w-5" />
        </div>
        <span className="text-xs mt-1">Mes prêts</span>
      </div>
      
      <div 
        className={`flex flex-col items-center ${isActive('/savings') ? 'text-[#0D6A51]' : 'text-gray-500'}`}
        onClick={() => navigate('/mobile-flow/savings')}
      >
        <div className={`p-2 rounded-full ${isActive('/savings') ? 'bg-[#0D6A51]/10' : ''}`}>
          <PiggyBank className="h-5 w-5" />
        </div>
        <span className="text-xs mt-1">Mes fonds</span>
      </div>
    </div>
  );
};

export default MobileNavigation;
