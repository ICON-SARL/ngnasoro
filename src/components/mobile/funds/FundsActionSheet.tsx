import React from 'react';
import { Smartphone, Store, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface FundsActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'deposit' | 'withdrawal';
  onMobileMoneySelected: () => void;
  onCashierScanSelected: () => void;
}

export const FundsActionSheet: React.FC<FundsActionSheetProps> = ({
  isOpen,
  onClose,
  actionType,
  onMobileMoneySelected,
  onCashierScanSelected,
}) => {
  const title = actionType === 'deposit' ? 'Recharger votre compte' : 'Retirer des fonds';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[400px] rounded-t-3xl">
        <SheetHeader>
          <div className="flex items-center justify-between mb-4">
            <SheetTitle className="text-xl font-bold text-[#0D6A51]">{title}</SheetTitle>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-6">
          {/* Mobile Money Option */}
          <button
            onClick={() => {
              onClose();
              onMobileMoneySelected();
            }}
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg text-gray-800">Mobile Money</h3>
              <p className="text-sm text-gray-600">Orange, MTN, Moov</p>
            </div>
          </button>

          {/* Caisse SFD Option */}
          <button
            onClick={() => {
              onClose();
              onCashierScanSelected();
            }}
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg text-gray-800">Caisse SFD</h3>
              <p className="text-sm text-gray-600">Scanner le QR code de la caisse</p>
            </div>
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Choisissez votre méthode de {actionType === 'deposit' ? 'rechargement' : 'retrait'}
        </p>
      </SheetContent>
    </Sheet>
  );
};
