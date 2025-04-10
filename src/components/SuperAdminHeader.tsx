
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/ModeToggle';
import { Briefcase, ChevronDown, Globe, LogOut, PieChart, Settings, UserPlus, Users, Wallet, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SuperAdminHeaderProps {
  additionalComponents?: React.ReactNode;
}

export function SuperAdminHeader({ additionalComponents }: SuperAdminHeaderProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    signOut();
    navigate('/admin/auth');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const userInitials = user?.user_metadata?.full_name 
    ? getInitials(user.user_metadata.full_name) 
    : 'AD';
  
  const isActiveRoute = (route: string) => {
    return location.pathname === route;
  };

  const navLinks = [
    { name: 'Tableau de bord', icon: <PieChart className="w-4 h-4 mr-2" />, path: '/admin-dashboard' },
    { name: 'SFDs', icon: <Briefcase className="w-4 h-4 mr-2" />, path: '/clients' },
    { name: 'Gestion SFD', icon: <Briefcase className="w-4 h-4 mr-2" />, path: '/sfd-management' },
    { name: 'Utilisateurs', icon: <Users className="w-4 h-4 mr-2" />, path: '/admin/users' },
    { name: 'Subventions', icon: <Wallet className="w-4 h-4 mr-2" />, path: '/admin/subsidies' },
    { name: 'Demandes SFD', icon: <UserPlus className="w-4 h-4 mr-2" />, path: '/admin/sfd-requests' },
    { name: 'Paramètres', icon: <Settings className="w-4 h-4 mr-2" />, path: '/admin/settings' },
  ];
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/admin-dashboard" className="flex items-center gap-2">
            <img src="/lovable-uploads/1fd2272c-2539-4f58-9841-15710204f204.png" alt="Logo" className="h-8" />
            <span className="font-semibold hidden md:block">N'GNA SÔRÔ Admin</span>
          </Link>
          
          <div className="hidden md:flex gap-1">
            {navLinks.map(link => (
              <Button 
                key={link.path}
                variant={isActiveRoute(link.path) ? "default" : "ghost"} 
                asChild
                size="sm"
              >
                <Link to={link.path} className="flex items-center">
                  {link.icon}
                  {link.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {additionalComponents}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline-block">Français</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Français</DropdownMenuItem>
              <DropdownMenuItem>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'admin@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-4">
                <Link 
                  to="/admin-dashboard" 
                  className="flex items-center py-2 px-3 rounded-lg hover:bg-muted"
                >
                  <PieChart className="mr-2 h-4 w-4" />
                  <span>Tableau de bord</span>
                </Link>
                {navLinks.map(link => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`flex items-center py-2 px-3 rounded-lg ${
                      isActiveRoute(link.path) ? 'bg-muted font-medium' : 'hover:bg-muted'
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
