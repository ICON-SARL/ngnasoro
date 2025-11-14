import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <Avatar className="h-14 w-14 border-2 border-primary-foreground/30 shadow-md">
            <AvatarImage src={avatarUrl || undefined} alt={userName} />
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-semibold text-lg">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
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
