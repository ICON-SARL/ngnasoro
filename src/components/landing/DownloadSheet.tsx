import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface DownloadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  'Comptes multi-SFD',
  'Prêts en 24h',
  'Coffres collaboratifs',
  '100% Sécurisé',
];

const DownloadSheet: React.FC<DownloadSheetProps> = ({ open, onOpenChange }) => {
  const { trigger } = useHapticFeedback();

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/android/i.test(ua)) return 'android';
    return 'desktop';
  };

  const handleDownload = () => {
    trigger('light');
    const device = getDeviceType();
    
    // For now, just show alert - will be replaced with actual store links
    alert(`Redirection vers le store ${device === 'ios' ? 'iOS' : device === 'android' ? 'Android' : 'PWA'}...`);
    onOpenChange(false);
  };

  const handleLater = () => {
    trigger('light');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-[2rem] bg-white border-t border-gray-200 pb-8"
      >
        {/* iOS Handle bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

        <div className="max-w-md mx-auto">
          {/* App Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-[1.5rem] bg-gradient-to-br from-[#0D6A51] to-[#176455] shadow-2xl flex items-center justify-center"
          >
            <span className="text-4xl">💰</span>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Télécharger N'GNA SÔRÔ
            </h3>
            <p className="text-gray-600 text-sm">
              Accédez à vos services financiers depuis votre téléphone
            </p>
          </motion.div>

          {/* Features rapides */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 mb-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-[#0D6A51]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-[#0D6A51]" />
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button
              onClick={handleDownload}
              className="w-full h-14 rounded-2xl bg-[#0D6A51] hover:bg-[#176455] text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              Télécharger maintenant
            </Button>

            <Button
              onClick={handleLater}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              Plus tard
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-3 mt-8 pt-8 border-t border-gray-100"
          >
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
              🔒 Sécurisé
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
              🇲🇱 Agréé MEREF
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
              ⭐ 4.8/5
            </Badge>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DownloadSheet;
