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
      className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground px-5 py-5 pb-10 rounded-b-[2rem]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo simplifié sans glow */}
          <div className="w-11 h-11 rounded-full overflow-hidden bg-white shadow-soft-sm">
            <img 
              src={logoNgnaSoro} 
              alt="N'GNA SÔRÔ" 
              className="w-full h-full object-cover p-1"
            />
          </div>
          <div>
            <p className="text-xs opacity-80 font-medium">Bonjour,</p>
            <h1 className="text-lg font-semibold">{userName}</h1>
          </div>
        </div>
        
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/mobile-flow/notifications')}
            className="text-primary-foreground hover:bg-primary-foreground/10 relative h-10 w-10"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
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
