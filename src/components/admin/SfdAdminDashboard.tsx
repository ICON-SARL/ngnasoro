
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart2,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Users,
  Settings,
  BanknoteIcon,
  FileCog,
  Book,
  BadgeDollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavigationLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

export function SfdAdminDashboard() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeSfdId, availableSfds, switchSfd } = useSfdDataAccess();

  // Fetching SFD details
  const { data: sfdDetails } = useQuery({
    queryKey: ['sfd-details', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return null;
      
      const { data, error } = await supabase
        .from('sfds')
        .select('name, code, logo_url, status')
        .eq('id', activeSfdId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId
  });

  // Fetching user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const links: NavigationLink[] = [
    { 
      href: '/agency-dashboard', 
      label: 'Tableau de bord', 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      href: '/agency-clients', 
      label: 'Clients', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      href: '/agency-transactions', 
      label: 'Transactions', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      href: '/agency-stats', 
      label: 'Statistiques', 
      icon: <BarChart2 className="h-5 w-5" /> 
    },
    { 
      href: '/agency-loans', 
      label: 'Prêts', 
      icon: <BanknoteIcon className="h-5 w-5" /> 
    },
    { 
      href: '/agency-settings', 
      label: 'Paramètres', 
      icon: <Settings className="h-5 w-5" /> 
    },
    {
      section: 'MEREF',
      href: '/meref-subsidy',
      label: 'Demandes de Subvention',
      icon: <BadgeDollarSign className="h-5 w-5" />
    },
    {
      href: '/meref-loan-management',
      label: 'Prêts MEREF',
      icon: <FileCog className="h-5 w-5" />
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and SFD selector */}
        <div className="flex items-center space-x-4">
          <Link to="/agency-dashboard" className="flex items-center space-x-2">
            <div className="bg-[#0D6A51] p-2 rounded-full">
              <Book className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden md:inline">
              {sfdDetails?.name || "SFD Dashboard"}
            </span>
          </Link>
          
          {availableSfds && availableSfds.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  {sfdDetails?.code || "Changer SFD"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {availableSfds.map((sfd) => (
                  <DropdownMenuItem 
                    key={sfd.id}
                    onClick={() => switchSfd(sfd.id)}
                    className={cn(
                      "cursor-pointer",
                      sfd.id === activeSfdId && "bg-primary/10"
                    )}
                  >
                    {sfd.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {links.map((link) => (
            <React.Fragment key={link.href}>
              {link.section && (
                <span className="text-xs font-semibold text-gray-500 px-3">
                  {link.section}
                </span>
              )}
              <Link
                to={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md flex items-center gap-x-2 transition-colors",
                  isActive(link.href)
                    ? "bg-[#0D6A51] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
        
        {/* User menu and mobile toggle */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.avatar_url || ""} />
                  <AvatarFallback>{userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden ml-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {availableSfds && availableSfds.length > 1 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Sélectionner SFD:</p>
                    <div className="space-y-1">
                      {availableSfds.map((sfd) => (
                        <Button 
                          key={sfd.id}
                          variant={sfd.id === activeSfdId ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            switchSfd(sfd.id);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {sfd.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <nav className="space-y-1">
                  <Separator className="my-4" />
                  
                  {links.map((link, index) => (
                    <React.Fragment key={link.href}>
                      {link.section && (
                        <div className="pt-4 pb-1">
                          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {link.section}
                          </p>
                        </div>
                      )}
                      <Link
                        to={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                          isActive(link.href)
                            ? "bg-[#0D6A51] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    </React.Fragment>
                  ))}
                </nav>
                
                <Separator className="my-4" />
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
