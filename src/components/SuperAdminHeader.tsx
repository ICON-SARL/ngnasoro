
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AdminLogout from '@/components/admin/shared/AdminLogout';

interface SuperAdminHeaderProps {
  additionalComponents?: React.ReactNode;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ additionalComponents }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-primary text-white sticky top-0 z-50">
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2 text-white"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/super-admin" className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center text-primary font-medium">
                M
              </div>
              <span className="ml-2 font-semibold hidden md:block">MEREF-SFD Admin</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/super-admin" className="text-white hover:text-white/80 transition-colors">
              Dashboard
            </Link>
            <Link to="/credit-approval" className="text-white hover:text-white/80 transition-colors">
              Crédits
            </Link>
            <Link to="/subsidy-management" className="text-white hover:text-white/80 transition-colors">
              Subventions
            </Link>
            <Link to="/sfd-management" className="text-white hover:text-white/80 transition-colors">
              SFDs
            </Link>
            <Link to="/reports" className="text-white hover:text-white/80 transition-colors">
              Rapports
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden md:flex relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 bg-primary-foreground/10 border-primary-foreground/20 text-white placeholder:text-gray-300 w-[180px] focus-visible:ring-white"
              />
            </div>

            {additionalComponents}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Paramètres Admin</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Préférences</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-foreground/30 text-white">
                      SA
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/auth/logout" className="text-red-600 cursor-pointer flex items-center">
                    <AdminLogout variant="link" size="sm" className="w-full justify-start" />
                    <span className="ml-2">Déconnexion</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden mt-3 py-2 border-t border-primary-foreground/10">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/super-admin"
                className="px-2 py-1.5 text-white hover:bg-primary-foreground/10 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/credit-approval"
                className="px-2 py-1.5 text-white hover:bg-primary-foreground/10 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Crédits
              </Link>
              <Link
                to="/subsidy-management"
                className="px-2 py-1.5 text-white hover:bg-primary-foreground/10 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Subventions
              </Link>
              <Link
                to="/sfd-management"
                className="px-2 py-1.5 text-white hover:bg-primary-foreground/10 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                SFDs
              </Link>
              <Link
                to="/reports"
                className="px-2 py-1.5 text-white hover:bg-primary-foreground/10 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                Rapports
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
