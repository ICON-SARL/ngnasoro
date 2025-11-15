import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoNgnaSoro from '@/assets/logo-ngna-soro.jpg';

interface DashboardHeaderProps {
  userName: string;
  avatarUrl?: string | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, avatarUrl }) => {
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  console.log('🎨 DashboardHeader render:', { userName, avatarUrl });

  return (
    <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground p-6 pb-8 rounded-b-3xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary via-[#FFAB2E] to-primary 
                            rounded-full opacity-75 blur-sm" />
            
            {/* Logo */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white shadow-md">
              <img 
                src={logoNgnaSoro} 
                alt="N'GNA SÔRÔ Logo" 
                className="w-full h-full object-cover p-1.5"
              />
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 font-medium">Bonjour,</p>
            <h1 className="text-xl font-bold">{userName}</h1>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
