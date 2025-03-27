
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useActionHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = async (action: string, data?: any) => {
    toast({
      title: `Action ${action}`,
      description: `Vous avez choisi de ${action.toLowerCase()}`,
    });
    
    if (action === 'Send' || action === 'Receive') {
      navigate('/mobile-flow/payment');
    } else if (action === 'Float me cash') {
      navigate('/mobile-flow/secure-payment');
    } else if (action === 'Schedule transfer') {
      navigate('/mobile-flow/schedule-transfer');
    } else if (action.startsWith('Transfer to')) {
      navigate('/mobile-flow/payment');
    } else if (action === 'Loans') {
      navigate('/mobile-flow/home-loan');
    } else if (action === 'Loan Activity') {
      navigate('/mobile-flow/loan-activity');
    } else if (action === 'Loan Details') {
      navigate('/mobile-flow/loan-details');
    } else if (action === 'Loan Setup') {
      navigate('/mobile-flow/loan-setup');
    } else if (action === 'Loan Process') {
      navigate('/mobile-flow/loan-process');
    } else if (action === 'Start') {
      navigate('/mobile-flow/main');
    } else if (action === 'Repayment') {
      navigate('/mobile-flow/secure-payment');
      // You would handle setting repayment amount here if data contains amount
    } else if (action === 'Home') {
      navigate('/mobile-flow/main');
    }
  };

  return { handleAction };
};
