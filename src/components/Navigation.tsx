
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Building, LayoutDashboard, Settings, Users } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const { userRole } = useAuth();
  
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  
  const navItems = [
    {
      title: 'Tableau de bord',
      path: '/agency-dashboard',
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      showFor: ['user', 'admin', 'superadmin', 'sfd_admin']
    },
    {
      title: 'Gestion des SFDs',
      path: '/sfd-management',
      icon: <Building className="h-4 w-4 mr-2" />,
      showFor: ['admin', 'superadmin']
    }
  ];
  
  const filteredNavItems = navItems.filter(item => 
    !item.showFor || item.showFor.includes(userRole || '')
  );
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                N'GNA SÔRÔ!
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
              {filteredNavItems.map(item => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    className="flex items-center"
                  >
                    {item.icon}
                    {item.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Profil
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden border-t border-gray-200 pt-2 pb-3 px-2 space-y-1">
        {filteredNavItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`block px-3 py-2 rounded-md ${
              location.pathname === item.path 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              {item.icon}
              {item.title}
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
