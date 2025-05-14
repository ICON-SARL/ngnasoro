
import React from 'react';
import MobileFlowRoutes from './MobileFlowRoutes';

interface MobileRouterProps {
  onAction?: (action: string, data?: any) => void;
}

export const MobileRouter: React.FC<MobileRouterProps> = ({ onAction }) => {
  // Default props for MobileFlowRoutes
  const defaultProps = {
    onAction: onAction || ((action: string, data?: any) => {
      console.log('Action triggered:', action, data);
    }),
    account: null,
    transactions: [],
    transactionsLoading: false,
    toggleMenu: () => {},
    showWelcome: false,
    setShowWelcome: () => {},
    handlePaymentSubmit: async (data: { recipient: string, amount: number, note: string }) => {
      console.log('Payment submitted:', data);
    }
  };

  return <MobileFlowRoutes {...defaultProps} />;
};

export default MobileRouter;
