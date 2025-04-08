
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';
import { AdminRole, AdminFormData } from './types';
import { useSFDList } from './hooks/useSFDList';

interface AdminFormProps {
  onSubmit: (data: AdminFormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

// Simple password strength calculator
const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  // Length check
  if (password.length >= 8) strength += 25;
  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 25;
  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 25;
  // Contains number or special char
  if (/[0-9!@#$%^&*]/.test(password)) strength += 25;
  
  return strength;
};

export const AdminForm: React.FC<AdminFormProps> = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    password: '',
    role: AdminRole.SFD_ADMIN,
    sfd_id: undefined
  });
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const { sfds, isLoading: sfdLoading } = useSFDList();
  
  // Form validation
  useEffect(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailPattern.test(formData.email);
    const isPasswordValid = formData.password.length >= 8;
    const isSfdValid = formData.role !== AdminRole.SFD_ADMIN || (formData.role === AdminRole.SFD_ADMIN && !!formData.sfd_id);
    
    setIsValid(isEmailValid && isPasswordValid && isSfdValid);
  }, [formData]);
  
  const handleChange = (key: keyof AdminFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    if (key === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Reset SFD ID if role is changed to non-SFD admin
    if (key === 'role' && value !== AdminRole.SFD_ADMIN) {
      setFormData(prev => ({ ...prev, sfd_id: undefined }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      await onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input 
          id="password" 
          type="password" 
          value={formData.password}
          onChange={e => handleChange('password', e.target.value)}
          required
        />
        <Progress value={passwordStrength} className="h-1" />
        <p className="text-xs text-muted-foreground">
          {passwordStrength < 50 ? "Mot de passe faible" : 
           passwordStrength < 75 ? "Mot de passe moyen" : 
           "Mot de passe fort"}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Rôle</Label>
        <Select 
          value={formData.role} 
          onValueChange={value => handleChange('role', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AdminRole.SUPER_ADMIN}>Super Admin</SelectItem>
            <SelectItem value={AdminRole.SFD_ADMIN}>Administrateur SFD</SelectItem>
            <SelectItem value={AdminRole.SUPPORT}>Support</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {formData.role === AdminRole.SFD_ADMIN && (
        <div className="space-y-2">
          <Label htmlFor="sfd">SFD Associée</Label>
          <Select 
            value={formData.sfd_id} 
            onValueChange={value => handleChange('sfd_id', value)}
            disabled={sfdLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une SFD" />
            </SelectTrigger>
            <SelectContent>
              {sfds.map(sfd => (
                <SelectItem key={sfd.id} value={sfd.id}>
                  {sfd.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 p-2 rounded-md flex items-center text-red-800">
          <AlertCircle className="h-4 w-4 mr-2" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <Button type="submit" disabled={!isValid || isLoading} className="w-full">
        {isLoading ? 'Création en cours...' : 'Créer le compte'}
      </Button>
    </form>
  );
};
