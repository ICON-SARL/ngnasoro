
import React from 'react';
import { ExternalLink, Calendar } from 'lucide-react';

interface LoanDetailsInfoProps {
  disbursementAmount: number;
  repaymentAmount: number;
  repaymentDate: string;
  formatCurrency: (amount: number) => string;
}

const LoanDetailsInfo = ({ 
  disbursementAmount, 
  repaymentAmount, 
  repaymentDate, 
  formatCurrency 
}: LoanDetailsInfoProps) => {
  return (
    <div>
      <div className="flex justify-between items-center py-2 border-t border-gray-100">
        <p className="text-gray-600">Disbursement amount</p>
        <div className="flex items-center">
          <p className="font-semibold">{formatCurrency(disbursementAmount)}</p>
          <div className="ml-1 h-4 w-4 bg-gray-100 rounded-full flex items-center justify-center">
            <ExternalLink className="h-2 w-2 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center py-2 border-t border-gray-100">
        <p className="text-gray-600">Repayment amount</p>
        <div className="flex items-center">
          <p className="font-semibold">{formatCurrency(repaymentAmount)}</p>
          <div className="ml-1 h-4 w-4 bg-gray-100 rounded-full flex items-center justify-center">
            <ExternalLink className="h-2 w-2 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center py-2 border-t border-gray-100">
        <p className="text-gray-600">Repayment date</p>
        <div className="flex items-center">
          <p className="font-semibold">{repaymentDate}</p>
          <div className="ml-1 h-4 w-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="h-2 w-2 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsInfo;
