
import React from 'react';
import {
  ErrorDisplay,
  CooldownAlert,
  useLoginForm
} from './login';
import SuccessState from './login/SuccessState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LoginFormProps {
  adminMode?: boolean;
  isSfdAdmin?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ adminMode = false, isSfdAdmin = false }) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    isLoading,
    errorMessage,
    cooldownActive,
    cooldownTime,
    emailSent,
    handleLogin
  } = useLoginForm(adminMode, isSfdAdmin);

  if (emailSent) {
    return <SuccessState email={email} />;
  }

  return (
    <div className="space-y-5 p-6 w-full">
      {adminMode && !isSfdAdmin && (
        <div className="flex items-center gap-2 border border-amber-200 bg-amber-50 p-3 rounded-md">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <div>
            <h3 className="font-medium text-amber-800">Connexion Administration</h3>
            <p className="text-xs text-amber-700">
              Accès réservé au personnel MEREF autorisé
            </p>
          </div>
          <Badge variant="outline" className="ml-auto bg-amber-100 text-amber-800 border-amber-200">
            Admin MEREF
          </Badge>
        </div>
      )}
      
      {isSfdAdmin && (
        <div className="flex items-center gap-2 border border-blue-200 bg-blue-50 p-3 rounded-md">
          <ShieldAlert className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-800">Connexion SFD</h3>
            <p className="text-xs text-blue-700">
              Accès réservé aux administrateurs SFD
            </p>
          </div>
          <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-800 border-blue-200">
            Admin SFD
          </Badge>
        </div>
      )}
      
      <ErrorDisplay message={errorMessage} />
      <CooldownAlert active={cooldownActive} remainingTime={cooldownTime} />

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium mb-1 block">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input 
                id="email"
                type="email"
                placeholder={isSfdAdmin ? "admin@sfd.ml" : adminMode ? "admin@meref.ml" : "jean.dulac@anatec.io"}
                className="pl-10 h-12 text-base border border-gray-300 focus:border-[#0D6A51] focus:ring-[#0D6A51] rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || cooldownActive}
                autoComplete="email"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="password" className="text-gray-700 font-medium mb-1 block">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••••"
                className="pl-10 pr-10 h-12 text-base border border-gray-300 focus:border-[#0D6A51] focus:ring-[#0D6A51] rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || cooldownActive}
                autoComplete="current-password"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-3 space-y-3">
          <button 
            type="submit" 
            className={`w-full h-12 rounded-md font-semibold text-white ${
              isSfdAdmin ? 'bg-blue-600 hover:bg-blue-700' :
              adminMode ? 'bg-amber-600 hover:bg-amber-700' : 
              'bg-[#0D6A51] hover:bg-[#0D6A51]/90'
            } transition-all shadow-md flex items-center justify-center gap-2`}
            disabled={isLoading || cooldownActive}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </span>
            ) : isSfdAdmin ? "Connexion SFD" : adminMode ? "Connexion Administration" : "Connexion"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
