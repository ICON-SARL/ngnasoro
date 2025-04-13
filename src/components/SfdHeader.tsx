
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
import { Globe, ChevronDown, LogOut, Menu, Users, CreditCard, PieChart, Settings, Landmark, Bell } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

export function SfdHeader() {
  const { signOut, user, activeSfdId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      // Notification de début de déconnexion
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      // Clear localStorage items first
      localStorage.removeItem('adminLastSeen');
      localStorage.removeItem('sb-xnqysvnychmsockivqhb-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Call signOut method
      await signOut();
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      // Force a full page reload to clear any remaining state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
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
    { name: 'Tableau de bord', icon: <PieChart className="w-4 h-4 mr-2" />, path: '/agency-dashboard' },
    { name: 'Clients', icon: <Users className="w-4 h-4 mr-2" />, path: '/sfd-clients' },
    { name: 'Prêts', icon: <CreditCard className="w-4 h-4 mr-2" />, path: '/sfd-loans' },
    { name: 'Subventions', icon: <Landmark className="w-4 h-4 mr-2" />, path: '/sfd-subsidy-requests' },
    { name: 'Paramètres', icon: <Settings className="w-4 h-4 mr-2" />, path: '/sfd-settings' },
  ];
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/agency-dashboard" className="flex items-center gap-2">
            <img src="/lovable-uploads/1fd2272c-2539-4f58-9841-15710204f204.png" alt="Logo" className="h-8" />
            <span className="font-semibold hidden md:block">N'GNA SÔRÔ SFD</span>
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive"></span>
          </Button>
          
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
                  <AvatarFallback className="bg-[#0D6A51] text-white">
                    {user?.user_metadata?.full_name 
                      ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase() 
                      : 'AD'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || 'SFD Admin'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'sfd@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/sfd-profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/sfd-settings')}>
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
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
                <button 
                  onClick={handleLogout}
                  className="flex items-center py-2 px-3 rounded-lg text-red-500 hover:bg-muted"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
