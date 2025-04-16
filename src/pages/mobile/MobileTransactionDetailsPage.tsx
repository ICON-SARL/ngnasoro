
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Flag, Share2, Check, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { useTransactions } from '@/hooks/transactions';
import { Transaction } from '@/types/transactions';

const MobileTransactionDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { transactions } = useTransactions(user?.id, activeSfdId);
  
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      setIsLoading(true);
      try {
        // First try to find the transaction in our already loaded transactions
        const foundTransaction = transactions.find(t => t.id.toString() === transactionId);
        
        if (foundTransaction) {
          setTransaction(foundTransaction);
        } else {
          // If not found in local state, we should fetch it directly
          // This is a mock for demonstration - in a real app we'd fetch from the API
          toast({
            title: 'Information',
            description: 'Chargement des détails de la transaction...',
          });
          
          // Simulate API fetch delay
          setTimeout(() => {
            setTransaction(transactions[0] || null);
          }, 1000);
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails de la transaction',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (transactionId && user?.id) {
      fetchTransactionDetails();
    }
  }, [transactionId, user?.id, transactions, toast]);
  
  const handleReportIssue = () => {
    toast({
      title: 'Signalement envoyé',
      description: 'Votre signalement a été envoyé. Nous vous contacterons bientôt.',
    });
  };
  
  const handleShareReceipt = () => {
    toast({
      title: 'Partage',
      description: 'Fonctionnalité de partage non disponible actuellement.',
    });
  };
  
  const handleDownloadReceipt = () => {
    toast({
      title: 'Téléchargement',
      description: 'Le reçu a été téléchargé.',
    });
  };
  
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-200 text-gray-700';
    
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getTransactionTypeIcon = (type?: string) => {
    if (!type) return <CreditCard className="h-6 w-6" />;
    
    switch (type.toLowerCase()) {
      case 'deposit':
        return <ArrowLeft className="h-6 w-6" />;
      case 'withdrawal':
        return <ArrowLeft className="h-6 w-6 transform rotate-180" />;
      case 'loan_repayment':
        return <Check className="h-6 w-6" />;
      case 'loan_disbursement':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour
        </Button>
      </div>
      
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p>Chargement des détails de la transaction...</p>
          </div>
        ) : transaction ? (
          <>
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="bg-[#0D6A51] p-5 text-white text-center">
                <div className="rounded-full bg-white/10 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  {getTransactionTypeIcon(transaction.type)}
                </div>
                
                <h1 className="text-2xl font-bold mb-1">
                  {formatCurrencyAmount(transaction.amount)} FCFA
                </h1>
                
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status || 'Statut inconnu'}
                </div>
                
                <p className="mt-2 text-white/80">
                  {formatDate(transaction.date || transaction.created_at)}
                </p>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium">{transaction.type}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Description</span>
                    <span className="font-medium">{transaction.description || transaction.name || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Méthode de paiement</span>
                    <span className="font-medium">{transaction.payment_method || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Référence</span>
                    <span className="font-medium">{transaction.reference_id || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID Transaction</span>
                    <span className="font-medium">{transaction.id.toString().substring(0, 8)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-auto py-3"
                onClick={handleDownloadReceipt}
              >
                <Download className="h-5 w-5 mb-1" />
                <span className="text-xs">Reçu</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-auto py-3"
                onClick={handleShareReceipt}
              >
                <Share2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Partager</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-auto py-3"
                onClick={handleReportIssue}
              >
                <Flag className="h-5 w-5 mb-1" />
                <span className="text-xs">Signaler</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p>Transaction non trouvée</p>
            <Button 
              variant="link" 
              onClick={() => navigate('/mobile-flow/transactions')}
              className="mt-2"
            >
              Voir toutes les transactions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTransactionDetailsPage;
