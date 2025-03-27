
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

export const useActionHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAction = async (action: string, data?: any) => {
    // Log the action for analytics
    console.log(`Action triggered: ${action}`, data);
    
    try {
      // Record the user action in the database for analytics
      if (user) {
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: action,
          category: 'USER_ACTION',
          status: 'success',
          severity: 'info',
          details: { data }
        });
      }
    
      // Show toast notification
      toast({
        title: `Action ${action}`,
        description: `Vous avez choisi de ${action.toLowerCase()}`,
      });
      
      // Handle navigation based on action
      if (action === 'Loans') {
        navigate('/mobile-flow/loan-application');
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
      } else if (action === 'View All SFDs') {
        navigate('/mobile-flow/multi-sfd');
      } else if (action === 'Transactions') {
        navigate('/mobile-flow/transactions');
      } else if (action === 'Savings') {
        navigate('/mobile-flow/savings');
      } else if (action === 'Profile') {
        navigate('/mobile-flow/profile');
      } else if (action === 'Support') {
        navigate('/mobile-flow/support');
      } else if (action === 'Clients') {
        navigate('/mobile-flow/clients');
      }
    } catch (error) {
      console.error('Error handling action:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du traitement de votre demande',
        variant: 'destructive',
      });
    }
  };

  return { handleAction };
};
