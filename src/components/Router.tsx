
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '../routes';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import MobileFlowRoutes from './mobile/routes/MobileFlowRoutes';

const Router = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

// This is the mobile router component that's being imported in MobileFlowPage
export const MobileRouter = () => {
  // Default props for the MobileFlowRoutes component
  const defaultProps = {
    onAction: (action: string, data?: any) => {
      console.log('Action triggered:', action, data);
    },
    account: null,
    transactions: [],
    transactionsLoading: false,
    toggleMenu: () => {},
    showWelcome: false,
    setShowWelcome: () => {},
    handlePaymentSubmit: async () => {
      console.log('Payment submitted');
    }
  };

  return <MobileFlowRoutes {...defaultProps} />;
};

export default Router;
