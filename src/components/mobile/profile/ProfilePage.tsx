
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Bell, 
  Shield, 
  Settings, 
  CreditCard, 
  ChevronRight 
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userName = user?.user_metadata?.full_name || user?.email || 'Utilisateur';
  const userEmail = user?.email || '';
  
  // Create the first letter of the name for the avatar
  const userInitial = userName.charAt(0).toUpperCase();
  
  const navigateTo = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0D6A51] to-[#064335] p-6 text-white">
        <h1 className="text-xl font-bold mb-6">Mon profil</h1>
        
        <div className="flex items-center mt-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mr-4 text-2xl font-bold">
            {userInitial}
          </div>
          <div>
            <h2 className="text-xl font-bold">{userName}</h2>
            <p className="text-white/80 text-sm">{userEmail}</p>
          </div>
        </div>
      </div>
      
      {/* Profile Sections */}
      <div className="p-4 space-y-4">
        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div 
            className="p-4 flex items-center justify-between border-b border-gray-100"
            onClick={() => {}}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span>Informations personnelles</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          
          <div 
            className="p-4 flex items-center justify-between border-b border-gray-100"
            onClick={() => navigateTo('/mobile-flow/profile/sfd-accounts')}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <span>Mes comptes SFD</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          
          <div 
            className="p-4 flex items-center justify-between"
            onClick={() => {}}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <span>Notifications</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm">
          <div 
            className="p-4 flex items-center justify-between"
            onClick={() => {}}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <span>Sécurité</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {/* Advanced Settings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div 
            className="p-4 flex items-center justify-between"
            onClick={() => {}}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <span>Paramètres avancés</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {/* App Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Version de l'application: 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
