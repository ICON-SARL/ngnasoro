
import React from 'react';
import { Wallet, SaveAll, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TransferOptionsProps {
  onWithdraw: () => void;
  onDeposit: () => void;
}

const TransferOptions: React.FC<TransferOptionsProps> = ({ onWithdraw, onDeposit }) => {
  return (
    <div className="space-y-4">
      <Card className="border hover:border-teal-500 cursor-pointer" onClick={onWithdraw}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Retirer des fonds</h3>
                <p className="text-xs text-gray-500">De votre compte épargne</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border hover:border-teal-500 cursor-pointer" onClick={onDeposit}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <SaveAll className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Déposer des fonds</h3>
                <p className="text-xs text-gray-500">Sur votre compte épargne</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferOptions;
