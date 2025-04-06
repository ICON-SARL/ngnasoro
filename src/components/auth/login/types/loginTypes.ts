
export interface LoginFormState {
  email: string;
  password: string;
  showPassword: boolean;
  authMode: 'simple' | 'advanced';
  showAuthDialog: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  cooldownActive: boolean;
  cooldownTime: number;
  emailSent: boolean;
}

export interface LoginFormProps {
  adminMode?: boolean;
  isSfdAdmin?: boolean;
}

export interface LoginFormHookReturn extends LoginFormState {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  toggleShowPassword: () => void;
  setShowAuthDialog: (show: boolean) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  adminMode: boolean;
  isSfdAdmin: boolean;
}
