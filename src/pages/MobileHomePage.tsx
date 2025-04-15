
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContextualHeader from '@/components/mobile/ContextualHeader';
import SFDSavingsOverview from '@/components/mobile/SFDSavingsOverview';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSfdAccount, isLoading } = useSfdAccounts();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ContextualHeader />
      
      <div className="p-4 space-y-4">
        <SFDSavingsOverview account={activeSfdAccount} />
        
        {/* Main Menu Options */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate('/mobile-flow/my-loans')}
            className="bg-white rounded-lg shadow p-4 text-center"
          >
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                <path d="M18 22a4 4 0 0 1-4-4V6" />
                <path d="M14 18a4 4 0 0 1-4-4V4" />
                <path d="M10 14a4 4 0 0 1-4-4V6" />
              </svg>
            </div>
            <p className="mt-2 font-medium">Mes prêts</p>
          </button>
          
          <button
            onClick={() => navigate('/mobile-flow/loans')}
            className="bg-white rounded-lg shadow p-4 text-center"
          >
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M6 2v12a2 2 0 0 0 2 2h12" />
                <path d="M8 16V2h12v14" />
                <path d="M2 8h4" />
                <path d="M2 12h4" />
                <path d="M2 16h4" />
                <circle cx="14" cy="8" r="2" />
                <path d="M20 19a2 2 0 1 1-4 0c0-1.1.9-2 2-2a2 2 0 0 1 2 2Z" />
                <path d="M16 19h-2a3 3 0 0 0-3 3" />
              </svg>
            </div>
            <p className="mt-2 font-medium">Demander un prêt</p>
          </button>
          
          <button className="bg-white rounded-lg shadow p-4 text-center">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <p className="mt-2 font-medium">Mes paiements</p>
          </button>
          
          <button className="bg-white rounded-lg shadow p-4 text-center">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <p className="mt-2 font-medium">Mes comptes</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileHomePage;
