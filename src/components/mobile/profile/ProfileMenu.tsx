
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  User,
  Shield,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  Settings,
  CreditCard,
  Building
} from 'lucide-react';

interface ProfileMenuProps {
  onLogout: () => Promise<void>;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <User className="h-5 w-5" />,
      label: 'Informations personnelles',
      action: () => navigate('/mobile-flow/profile/personal-info')
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: 'Sécurité du compte',
      action: () => navigate('/mobile-flow/profile/security')
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications',
      action: () => navigate('/mobile-flow/profile/notifications')
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Mes prêts',
      action: () => navigate('/mobile-flow/my-loans')
    },
    {
      icon: <Building className="h-5 w-5" />,
      label: 'Sélection de SFD',
      action: () => navigate('/mobile-flow/select-sfd')
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: 'Aide et support',
      action: () => navigate('/mobile-flow/help')
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Conditions d\'utilisation',
      action: () => navigate('/mobile-flow/terms')
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Paramètres',
      action: () => navigate('/mobile-flow/settings')
    }
  ];

  return (
    <Card className="border-0 shadow-sm mt-4">
      <CardContent className="p-0">
        <div className="divide-y">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start p-4 h-auto rounded-none"
              onClick={item.action}
            >
              <div className="flex items-center w-full">
                <div className="text-[#0D6A51] mr-3">{item.icon}</div>
                <span>{item.label}</span>
              </div>
            </Button>
          ))}
          
          <Button
            variant="ghost"
            className="w-full justify-start p-4 h-auto rounded-none text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <div className="flex items-center w-full">
              <LogOut className="h-5 w-5 mr-3" />
              <span>Déconnexion</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileMenu;
