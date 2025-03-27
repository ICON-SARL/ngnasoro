
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { Transaction } from '@/types/transactions';

interface TransactionDetailsProps {
  transaction?: Transaction;
  isLoading?: boolean;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction, isLoading }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Détails de la transaction</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!transaction) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Détails de la transaction</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Transaction introuvable</h2>
            <p className="text-gray-500 mb-4">Impossible de trouver les détails de cette transaction.</p>
            <Button onClick={() => navigate(-1)}>Retour</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isPositive = transaction.type === 'deposit' || transaction.type === 'loan_disbursement';
  const statusIcon = transaction.status === 'success' ? CheckCircle : 
                    transaction.status === 'pending' ? Clock : XCircle;
  
  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'deposit': return 'Dépôt';
      case 'withdrawal': return 'Retrait';
      case 'loan_repayment': return 'Remboursement de prêt';
      case 'loan_disbursement': return 'Décaissement de prêt';
      default: return type;
    }
  };
  
  const formatTransactionStatus = (status: string) => {
    switch (status) {
      case 'success': return 'Réussie';
      case 'pending': return 'En attente';
      case 'failed': return 'Échouée';
      default: return status;
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">Détails de la transaction</h1>
      </div>
      
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Type de transaction</p>
              <h2 className="text-lg font-semibold">{formatTransactionType(transaction.type)}</h2>
            </div>
            <div className={`flex items-center ${
              transaction.status === 'success' ? 'text-green-500' : 
              transaction.status === 'pending' ? 'text-amber-500' : 'text-red-500'
            }`}>
              {React.createElement(statusIcon, { className: 'h-5 w-5 mr-1' })}
              <span className="text-sm font-medium">{formatTransactionStatus(transaction.status)}</span>
            </div>
          </div>
          
          <div className="border-t border-b py-4 my-4">
            <p className="text-sm text-gray-500 mb-1">Montant</p>
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-gray-800'}`}>
              {isPositive ? '+' : '-'}{formatCurrencyAmount(Math.abs(transaction.amount))} FCFA
            </p>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Référence</p>
              <p className="font-medium">{transaction.id}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">
                {new Date(transaction.date || transaction.created_at).toLocaleString()}
              </p>
            </div>
            
            {transaction.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{transaction.description}</p>
              </div>
            )}
            
            {transaction.payment_method && (
              <div>
                <p className="text-sm text-gray-500">Méthode de paiement</p>
                <p className="font-medium">{transaction.payment_method}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex space-x-2">
        <Button className="flex-1" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Télécharger le reçu
        </Button>
        <Button className="flex-1" variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
      </div>
    </div>
  );
};

export default TransactionDetails;
