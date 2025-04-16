
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
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { ModeToggle } from '@/components/ModeToggle';
import { Globe, ChevronDown, LogOut, Menu, Users, CreditCard, PieChart, Settings, Landmark, Bell, Building, BarChart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import LogoutButton from '@/components/LogoutButton';

export function SfdHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { activeSfdId, sfdData } = useSfdDataAccess();
  
  // Trouver les informations de la SFD active
  const activeSfd = sfdData.find(sfd => sfd.id === activeSfdId);
  const sfdName = activeSfd?.name || 'SFD non sélectionnée';
  
  const handleLogout = async () => {
    try {
      // Notification de début de déconnexion
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      console.log("SfdHeader - Initiating signOut");
      const { error } = await signOut();
      
      if (error) {
        console.error("SfdHeader - Error during signOut:", error);
        throw error;
      }
      
      console.log("SfdHeader - SignOut completed successfully");
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      // Force a full page reload and redirect to clear any remaining state
      console.log("SfdHeader - Redirecting to /sfd/auth");
      setTimeout(() => {
        window.location.href = '/sfd/auth';
      }, 100);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur s'est produite lors de la déconnexion",
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
  
  const isActiveRoute = (route: string) => {
    return location.pathname === route;
  };

  const navLinks = [
    { name: 'Tableau de bord', icon: <PieChart className="w-4 h-4 mr-2" />, path: '/agency-dashboard' },
    { name: 'Clients', icon: <Users className="w-4 h-4 mr-2" />, path: '/sfd-clients' },
    { name: 'Prêts', icon: <CreditCard className="w-4 h-4 mr-2" />, path: '/sfd-loans' },
    { name: 'Transactions', icon: <BarChart className="w-4 h-4 mr-2" />, path: '/sfd-transactions' },
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
          
          {/* Affichage du nom de la SFD active */}
          <Badge variant="outline" className="bg-primary/10 text-primary flex items-center gap-1 px-3 py-1 hidden md:flex">
            <Building className="h-3.5 w-3.5 mr-1" />
            {sfdName}
          </Badge>
          
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
          {/* Badge SFD pour mobile */}
          <Badge variant="outline" className="bg-primary/10 text-primary px-2 py-1 md:hidden">
            <Building className="h-3 w-3 mr-1" />
            {sfdName.length > 10 ? `${sfdName.substring(0, 10)}...` : sfdName}
          </Badge>
          
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
                  {activeSfd && (
                    <p className="text-xs font-medium mt-1 text-primary">
                      SFD: {sfdName}
                    </p>
                  )}
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
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
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
