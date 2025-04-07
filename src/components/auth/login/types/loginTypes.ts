
export interface LoginFormProps {
  adminMode?: boolean;
  isSfdAdmin?: boolean;
}

export interface LoginFormHookReturn {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  authMode: 'simple' | 'advanced';
  showAuthDialog: boolean;
  setShowAuthDialog: (show: boolean) => void;
  isLoading: boolean;
  errorMessage: string | null;
  cooldownActive: boolean;
  cooldownTime: number;
  emailSent: boolean;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  adminMode: boolean;
  isSfdAdmin: boolean;
}
