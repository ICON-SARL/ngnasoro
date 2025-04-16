
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MainDashboard from '@/components/mobile/MainDashboard';
import Footer from '@/components/Footer';
import MobileNavigation from '@/components/mobile/MobileNavigation';

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleAction = (action: string, data?: any) => {
    switch (action) {
      case 'Loans':
        navigate('/mobile-flow/loans');
        break;
      case 'LoanPlans':
        navigate('/mobile-flow/loan-plans');
        break;
      case 'MyLoans':
        navigate('/mobile-flow/my-loans');
        break;
      case 'Transactions':
        navigate('/mobile-flow/transactions');
        break;
      case 'Payment':
        navigate('/mobile-flow/payment');
        break;
      case 'Account':
        navigate('/mobile-flow/account');
        break;
      default:
        // Si l'action a des données associées, les passer via state
        if (data) {
          navigate(`/mobile-flow/${action.toLowerCase()}`, { state: data });
        } else {
          navigate(`/mobile-flow/${action.toLowerCase()}`);
        }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <MainDashboard onAction={handleAction} />
      <Footer />
      <MobileNavigation />
    </div>
  );
};

export default MobileMainPage;
