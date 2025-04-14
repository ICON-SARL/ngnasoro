
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
import { PieChart, ChevronDown, Globe, LogOut, Settings, Users, Menu, LayoutDashboard, FileText, Shield, UserRound } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SuperAdminHeaderProps {
  additionalComponents?: React.ReactNode;
}

export function SuperAdminHeader({ additionalComponents }: SuperAdminHeaderProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      await signOut();
      
      // Show success toast
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      
      // Force a full page reload and redirect
      window.location.href = '/admin/auth';
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive",
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
  
  const isActiveRoute = (route: string) => {
    return location.pathname === route;
  };

  const navLinks = [
    { name: 'Tableau de bord', icon: <LayoutDashboard className="w-4 h-4 mr-2" />, path: '/super-admin-dashboard' },
    { name: 'Gestion SFD', icon: <PieChart className="w-4 h-4 mr-2" />, path: '/sfd-management' },
    { name: 'Utilisateurs', icon: <Users className="w-4 h-4 mr-2" />, path: '/admin/users' },
    { name: 'Paramètres', icon: <Settings className="w-4 h-4 mr-2" />, path: '/admin/settings' },
  ];
  
  const userInitials = user?.user_metadata?.full_name 
    ? getInitials(user.user_metadata.full_name) 
    : 'AD';
    
  return (
    <header className="sticky top-0 z-40 border-b bg-gradient-to-r from-[#0D6A51]/90 to-[#0D6A51]/70 text-white shadow-md">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/super-admin-dashboard" className="flex items-center gap-2">
            <img src="/lovable-uploads/1fd2272c-2539-4f58-9841-15710204f204.png" alt="Logo" className="h-8" />
            <div className="font-semibold hidden md:block">
              <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-white">SÔRÔ</span>
              <span className="ml-2 text-xs bg-[#FFAB2E]/20 px-2 py-0.5 rounded text-[#FFAB2E]">Admin</span>
            </div>
          </Link>
          
          <div className="hidden md:flex gap-1">
            {navLinks.map(link => (
              <Button 
                key={link.path}
                variant={isActiveRoute(link.path) ? "secondary" : "ghost"} 
                asChild
                size="sm"
                className={cn(
                  "text-white hover:text-white", 
                  isActiveRoute(link.path) 
                    ? "bg-white/20 hover:bg-white/30" 
                    : "hover:bg-white/10"
                )}
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
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-white hover:bg-white/10"
            onClick={() => navigate('/admin/users')}
          >
            <UserRound className="h-5 w-5" />
            <span className="sr-only">Utilisateurs</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
            <Shield className="h-5 w-5" />
            <span className="sr-only">Sécurité</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
            <FileText className="h-5 w-5" />
            <span className="sr-only">Rapports</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
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
              <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden border border-white/30 hover:bg-white/10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#FFAB2E] text-[#0D6A51]">
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
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/10">
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
