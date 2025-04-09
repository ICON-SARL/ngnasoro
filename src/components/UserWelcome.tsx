
import React from 'react';
import { cn } from '@/lib/utils';
import { User } from '@supabase/supabase-js';

interface UserWelcomeProps {
  user: User | null;
  className?: string;
}

export function UserWelcome({ user, className }: UserWelcomeProps) {
  const userName = user?.user_metadata?.full_name || user?.email || 'Client';
  const currentHour = new Date().getHours();
  
  const greeting = currentHour < 12 
    ? "Bonjour" 
    : currentHour < 18 
      ? "Bon après-midi" 
      : "Bonsoir";

  return (
    <div className={cn("", className)}>
      <h1 className="text-2xl font-bold">
        {greeting}, {userName}
      </h1>
      <p className="text-gray-600">Bienvenue sur votre tableau de bord N'gna Sôrô!</p>
    </div>
  );
}

export default UserWelcome;
