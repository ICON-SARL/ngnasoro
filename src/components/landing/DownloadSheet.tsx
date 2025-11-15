import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface DownloadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-[2rem] bg-white border-t border-gray-100 pb-6 pt-4"
      >
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

        <div className="max-w-md mx-auto">
          {/* Logo simplifié */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-lg flex items-center justify-center border-2 border-gray-100"
          >
            <img 
              src="/lovable-uploads/1fd2272c-2539-4f58-9841-15710204f204.png" 
              alt="N'GNA SÔRÔ" 
              className="w-10 h-10 object-contain"
            />
          </motion.div>

          {/* Titre court */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h3 className="text-xl font-bold text-gray-900">
              Télécharger l'application
            </h3>
          </motion.div>

          {/* Bouton unique */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleDownload}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-[#FFAB2E] hover:opacity-90 text-white font-semibold shadow-lg transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              Télécharger
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DownloadSheet;
