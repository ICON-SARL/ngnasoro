import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useMobileNotifications } from '@/hooks/useMobileNotifications';
import logoNgnaSoro from '@/assets/logo-ngna-soro.jpg';

interface DashboardHeaderProps {
  userName: string;
  avatarUrl?: string | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, avatarUrl }) => {
  const navigate = useNavigate();
  const { unreadCount } = useMobileNotifications();

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground p-6 pb-8 rounded-b-[2rem] shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Soft glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-accent/50 to-primary/50 rounded-full blur-md opacity-60" />
            
            {/* Logo container */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-card shadow-lg ring-2 ring-white/20">
              <img 
                src={logoNgnaSoro} 
                alt="N'GNA SÔRÔ Logo" 
                className="w-full h-full object-cover p-1.5"
              />
            </div>
          </motion.div>
          <div>
            <p className="text-sm opacity-90 font-medium">Bonjour,</p>
            <h1 className="text-xl font-bold">{userName}</h1>
          </div>
        </div>
        
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/mobile-flow/notifications')}
            className="text-primary-foreground hover:bg-primary-foreground/10 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
