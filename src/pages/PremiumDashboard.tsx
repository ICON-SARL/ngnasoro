
import React from 'react';
import PremiumDashboardComponent from '@/components/PremiumDashboard';
import MobileNavigation from '@/components/MobileNavigation';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

const PremiumDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center text-primary font-medium">
              S
            </div>
            <span className="font-medium text-lg">SecureFlux</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <span className="text-sm font-medium">Amadou Traoré</span>
            </div>
            <Button variant="secondary" size="sm" className="gap-1">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Profil</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-primary-foreground/10">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <PremiumDashboardComponent />
      <MobileNavigation />
    </div>
  );
};

export default PremiumDashboardPage;
