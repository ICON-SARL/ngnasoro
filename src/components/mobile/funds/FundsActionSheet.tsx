import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Smartphone, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const title = actionType === 'deposit' ? 'Recharger votre compte' : 'Retirer de l\'argent';
  const description = actionType === 'deposit' 
    ? 'Choisissez votre mode de paiement' 
    : 'Choisissez votre mode de retrait';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold text-foreground">{title}</SheetTitle>
          <SheetDescription className="text-muted-foreground">{description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 pb-6">
          {/* Mobile Money Option */}
          <motion.button
            onClick={onMobileMoneySelected}
            className="w-full p-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl text-left shadow-lg hover:shadow-xl transition-shadow"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-white">
                <h3 className="text-lg font-semibold mb-1">Mobile Money</h3>
                <p className="text-sm text-white/80">Orange, MTN, Moov</p>
              </div>
            </div>
          </motion.button>

          {/* Cashier QR Option */}
          <motion.button
            onClick={onCashierScanSelected}
            className="w-full p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-left shadow-lg hover:shadow-xl transition-shadow"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-white">
                <h3 className="text-lg font-semibold mb-1">Caisse SFD</h3>
                <p className="text-sm text-white/80">Scanner le QR code à la caisse</p>
              </div>
            </div>
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
