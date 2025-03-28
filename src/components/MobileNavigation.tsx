
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, CreditCard, BarChart3, User, Building, Plus } from 'lucide-react';

interface MobileNavigationProps {
  onAction?: (action: string, data?: any) => void;
  isHeader?: boolean;
  className?: string;
  showLoanOption?: boolean;
  showAdminOption?: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  onAction,
  isHeader = false,
  className = '',
  showLoanOption = true,
  showAdminOption = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/mobile-flow/transactions')) return 'transactions';
    if (path.includes('/mobile-flow/funds')) return 'funds';
    if (path.includes('/mobile-flow/loan-activity') || path.includes('/mobile-flow/loan-process') || path.includes('/mobile-flow/secure-payment')) return 'loans';
    if (path.includes('/mobile-flow/profile')) return 'profile';
    if (path.includes('/mobile-flow/sfd-clients')) return 'admin';
    return 'home';
  };
  
  const activeTab = getActiveTab();
  
  const handleTabClick = (tab: string) => {
    switch (tab) {
      case 'home':
        navigate('/mobile-flow');
        break;
      case 'transactions':
        navigate('/mobile-flow/transactions');
        break;
      case 'funds':
        navigate('/mobile-flow/funds');
        break;
      case 'loans':
        navigate('/mobile-flow/loan-activity');
        break;
      case 'profile':
        navigate('/mobile-flow/profile');
        break;
      case 'admin':
        navigate('/mobile-flow/sfd-clients');
        break;
      default:
        navigate('/mobile-flow');
    }
    
    if (onAction) {
      onAction(tab);
    }
  };

  return (
    <div className={cn(
      "bg-white border-t border-gray-200 px-2 pt-1 pb-0.5",
      isHeader ? "border-t-0 border-b border-gray-200 bg-white/50 backdrop-blur-sm" : "fixed bottom-0 left-0 right-0 z-50",
      className
    )}>
      <div className="grid grid-cols-5 gap-1">
        <TabButton 
          icon={<Home className="h-5 w-5" />} 
          label="Accueil" 
          active={activeTab === 'home'} 
          onClick={() => handleTabClick('home')} 
        />
        
        <TabButton 
          icon={<BarChart3 className="h-5 w-5" />} 
          label="Transactions" 
          active={activeTab === 'transactions'} 
          onClick={() => handleTabClick('transactions')} 
        />
        
        {showLoanOption && (
          <TabButton 
            icon={<CreditCard className="h-5 w-5" />} 
            label="Prêts" 
            active={activeTab === 'loans'} 
            onClick={() => handleTabClick('loans')} 
          />
        )}
        
        {showAdminOption && (
          <TabButton 
            icon={<Building className="h-5 w-5" />} 
            label="Admin" 
            active={activeTab === 'admin'} 
            onClick={() => handleTabClick('admin')} 
          />
        )}
        
        <TabButton 
          icon={<User className="h-5 w-5" />} 
          label="Profil" 
          active={activeTab === 'profile'} 
          onClick={() => handleTabClick('profile')} 
        />
      </div>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, active, onClick }) => {
  return (
    <button 
      className={cn(
        "flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors",
        active 
          ? "text-[#0D6A51]" 
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-0.5">{label}</span>
    </button>
  );
};

export default MobileNavigation;
