
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // signIn only expects email now
    await signIn(email);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
      >
        Se connecter
      </Button>
      
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Ou</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" type="button">Google</Button>
        <Button variant="outline" type="button">Facebook</Button>
      </div>
    </form>
  );
};

export default LoginForm;
