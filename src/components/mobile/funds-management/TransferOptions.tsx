
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
      <Card className="border hover:border-primary cursor-pointer" onClick={onWithdraw}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Mobile Money - Retrait</h3>
                <p className="text-xs text-gray-500">Retirez via votre compte mobile money</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border hover:border-primary cursor-pointer" onClick={onDeposit}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <SaveAll className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Mobile Money - Dépôt</h3>
                <p className="text-xs text-gray-500">Déposez via votre compte mobile money</p>
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
