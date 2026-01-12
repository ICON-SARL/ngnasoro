import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Smartphone, Building2, ChevronRight } from 'lucide-react';
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
    ? 'Choisissez votre méthode' 
    : 'Choisissez votre méthode';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl border-t border-border">
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="text-xl font-semibold text-foreground">{title}</SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">{description}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3 pb-6">
          {/* Mobile Money Option */}
          <motion.button
            onClick={onMobileMoneySelected}
            className="w-full p-4 bg-card rounded-xl text-left border border-primary/20 hover:border-primary/40 transition-all shadow-soft-sm"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Mobile Money</h3>
                <p className="text-sm text-muted-foreground">Orange, MTN, Moov</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </motion.button>

          {/* Cashier QR Option */}
          <motion.button
            onClick={onCashierScanSelected}
            className="w-full p-4 bg-card rounded-xl text-left border border-border hover:border-muted-foreground/30 transition-all shadow-soft-sm"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Caisse SFD</h3>
                <p className="text-sm text-muted-foreground">Scanner le QR code</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
