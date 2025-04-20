
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Building, Users, CreditCard, FileText, Bell, Settings, HelpCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SfdAdminLayoutProps {
  children: React.ReactNode;
}

export function SfdAdminLayout({ children }: SfdAdminLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const getInitials = (name: string = '') => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const navItems = [
    { icon: <Building className="h-5 w-5" />, label: "Tableau de bord", href: "/agency-dashboard" },
    { icon: <Users className="h-5 w-5" />, label: "Clients", href: "/sfd-clients" },
    { icon: <CreditCard className="h-5 w-5" />, label: "Prêts", href: "/sfd-loans" },
    { icon: <FileText className="h-5 w-5" />, label: "Demandes d'adhésion", href: "/sfd-adhesion-requests" },
  ];
  
  const secondaryNavItems = [
    { icon: <Settings className="h-5 w-5" />, label: "Paramètres", href: "/sfd-settings" },
    { icon: <HelpCircle className="h-5 w-5" />, label: "Aide", href: "/sfd-help" },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Administration SFD</h1>
        </div>
        
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-6">
            <div className="space-y-1">
              {navItems.map((item, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate(item.href)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              {secondaryNavItems.map((item, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate(item.href)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </div>
          </nav>
        </ScrollArea>
        
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center mb-4">
            <Avatar className="h-9 w-9 mr-2">
              <AvatarFallback>{getInitials(user?.user_metadata?.full_name || user?.email)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrateur SFD</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>
      
      {/* Mobile layout */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-bold">Administration SFD</h2>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-6">
                    <div className="space-y-1">
                      {navItems.map((item, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => navigate(item.href)}
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Button>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-1">
                      {secondaryNavItems.map((item, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => navigate(item.href)}
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t mt-auto">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-9 w-9 mr-2">
                      <AvatarFallback>{getInitials(user?.user_metadata?.full_name || user?.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                      <p className="text-xs text-muted-foreground">Administrateur SFD</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="ml-4 md:ml-0">
            <h1 className="md:hidden text-xl font-bold">Admin SFD</h1>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 bg-red-500 rounded-full h-2 w-2"></span>
            </Button>
            
            <div className="hidden md:flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user?.user_metadata?.full_name || user?.email)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
