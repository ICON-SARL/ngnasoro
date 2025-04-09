
import React from 'react';

interface TransactionItemProps {
  id: string;
  description: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  currency: string;
}

const TransactionItem = ({ id, description, date, amount, type, currency }: TransactionItemProps) => {
  return (
    <div className="flex justify-between items-center p-3 border-b">
      <div>
        <p className="font-medium">{description}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
      <span className={type === 'credit' ? 'text-green-600' : 'text-red-600'}>
        {type === 'credit' ? '+' : '-'}{amount.toLocaleString()} {currency}
      </span>
    </div>
  );
};

export default TransactionItem;
