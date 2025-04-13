
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * This hook safely fetches transactions only when a valid user is present
 */
export function useConditionalTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Mock function - in a real implementation you would call your API
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockTransactions = [
          {
            id: 1,
            name: "Dépôt mensuel",
            type: "deposit",
            amount: "+25,000 FCFA",
            date: "12/04/2025",
            avatar: null
          },
          {
            id: 2,
            name: "Remboursement prêt",
            type: "withdrawal",
            amount: "-15,000 FCFA",
            date: "10/04/2025",
            avatar: null
          }
        ];
        
        setTransactions(mockTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  return {
    transactions,
    isLoading
  };
}
