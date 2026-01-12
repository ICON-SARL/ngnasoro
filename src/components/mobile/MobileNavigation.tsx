import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, CreditCard, Headset } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname.includes(path);
  
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/mobile-flow/dashboard' },
    { icon: CreditCard, label: 'Prêts', path: '/mobile-flow/loans' },
    { icon: Headset, label: 'Support', path: '/mobile-flow/support' },
    { icon: User, label: 'Profil', path: '/mobile-flow/profile' },
  ];
  
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-2xl z-50 safe-area-bottom"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => navigate(item.path)}
            >
              <motion.div
                animate={active ? { scale: 1.1 } : { scale: 1 }}
                className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-primary/10' : ''}`}
              >
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MobileNavigation;
