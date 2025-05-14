
import React from 'react';
import { Account } from '@/types/transactions';

interface MainDashboardProps {
  account: Account | null;
  transactions: any[];
  transactionsLoading: boolean;
  onAction: (action: string, data?: any) => void;
  toggleMenu: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  account,
  transactions,
  transactionsLoading,
  onAction,
  toggleMenu
}) => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tableau de bord</h1>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Solde du compte</h2>
        {account ? (
          <p className="text-2xl font-bold text-green-600">{account.balance} FCFA</p>
        ) : (
          <p className="text-gray-500">Aucun compte connecté</p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Transactions récentes</h2>
        {transactionsLoading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : transactions.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {transactions.slice(0, 5).map((transaction, index) => (
              <li key={index} className="py-2">
                <div className="flex justify-between">
                  <span>{transaction.description || 'Transaction'}</span>
                  <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} FCFA
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aucune transaction récente</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onAction('ViewTransactions')} 
          className="bg-[#0D6A51] text-white p-3 rounded-lg text-center flex flex-col items-center"
        >
          <span className="text-sm">Voir toutes les transactions</span>
        </button>
        <button 
          onClick={() => onAction('ManageFunds')} 
          className="bg-[#0D6A51] text-white p-3 rounded-lg text-center flex flex-col items-center"
        >
          <span className="text-sm">Gérer mes fonds</span>
        </button>
      </div>
    </div>
  );
};

export default MainDashboard;
