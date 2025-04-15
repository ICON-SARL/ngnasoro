
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
import { sfdNavigationItems } from './sfd/SfdNavigation';

export function SfdHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { activeSfdId, sfdData } = useSfdDataAccess();
  
  // Trouver les informations de la SFD active
  const activeSfd = sfdData.find(sfd => sfd.id === activeSfdId);
  const sfdName = activeSfd?.name || 'SFD non sélectionnée';
  
  const isActiveRoute = (route: string) => {
    return location.pathname === route;
  };

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
            {sfdNavigationItems.map(link => (
              <Button 
                key={link.path}
                variant={isActiveRoute(link.path) ? "default" : "ghost"} 
                asChild
                size="sm"
                onClick={() => navigate(link.path)}
              >
                <Link to={link.path} className="flex items-center">
                  {link.icon}
                  {link.label}
                </Link>
              </Button>
            ))}
            <Button 
              variant={isActiveRoute("/sfd-settings") ? "default" : "ghost"} 
              asChild
              size="sm"
              onClick={() => navigate("/sfd-settings")}
            >
              <Link to="/sfd-settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Link>
            </Button>
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
              <DropdownMenuItem className="text-red-500">
                <LogoutButton variant="ghost" size="sm" iconOnly className="p-0 h-auto" />
                <span className="ml-2">Se déconnecter</span>
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
                {sfdNavigationItems.map(link => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`flex items-center py-2 px-3 rounded-lg ${
                      isActiveRoute(link.path) ? 'bg-muted font-medium' : 'hover:bg-muted'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
                <Link 
                  to="/sfd-settings" 
                  className={`flex items-center py-2 px-3 rounded-lg ${
                    isActiveRoute("/sfd-settings") ? 'bg-muted font-medium' : 'hover:bg-muted'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Paramètres</span>
                </Link>
                <div className="flex items-center py-2 px-3 rounded-lg text-red-500 hover:bg-muted">
                  <LogoutButton 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto flex items-center w-full justify-start text-red-500 hover:bg-transparent" 
                    iconOnly={false} 
                    text="Se déconnecter"
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
