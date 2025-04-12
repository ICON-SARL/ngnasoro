
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';

interface ConnectSfdButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const ConnectSfdButton: React.FC<ConnectSfdButtonProps> = ({ 
  className = '', 
  variant = 'default',
  size = 'default'
}) => {
  const navigate = useNavigate();

  const handleConnect = () => {
    navigate('/sfd-setup');
  };

  return (
    <Button
      className={`bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white ${className}`}
      onClick={handleConnect}
      variant={variant}
      size={size}
    >
      <Building className="h-4 w-4 mr-2" />
      Connecter un SFD
    </Button>
  );
};

export default ConnectSfdButton;
