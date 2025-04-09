
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search, Settings, User, X } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-700"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/super-admin" className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-green-600 flex items-center justify-center text-white font-medium">
                M
              </div>
              <span className="ml-2 font-medium hidden md:block text-gray-800">MEREF-SFD</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/super-admin" className="text-gray-700 hover:text-green-600 transition-colors text-sm">
              Dashboard
            </Link>
            <Link to="/credit-approval" className="text-gray-700 hover:text-green-600 transition-colors text-sm">
              Crédits
            </Link>
            <Link to="/sfd-management" className="text-gray-700 hover:text-green-600 transition-colors text-sm">
              SFDs
            </Link>
            <Link to="/reports" className="text-gray-700 hover:text-green-600 transition-colors text-sm">
              Rapports
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden md:flex relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 border-gray-200 text-sm w-[180px] focus-visible:ring-green-500 focus-visible:ring-opacity-50"
              />
            </div>

            {additionalComponents}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                    <AvatarFallback className="bg-green-100 text-green-800">
                      SA
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden mt-3 py-3 border-t border-gray-100">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/super-admin"
                className="px-2 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-green-600 rounded-md text-sm"
                onClick={() => setShowMobileMenu(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/credit-approval"
                className="px-2 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-green-600 rounded-md text-sm"
                onClick={() => setShowMobileMenu(false)}
              >
                Crédits
              </Link>
              <Link
                to="/sfd-management"
                className="px-2 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-green-600 rounded-md text-sm"
                onClick={() => setShowMobileMenu(false)}
              >
                SFDs
              </Link>
              <Link
                to="/reports"
                className="px-2 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-green-600 rounded-md text-sm"
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
