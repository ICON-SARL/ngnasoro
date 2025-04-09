
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export interface SfdSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSfdSelected?: () => void;
}

export function SfdSelector({ 
  isOpen, 
  onClose, 
  onSfdSelected 
}: SfdSelectorProps = {}) {
  const { activeSfdId } = useAuth();
  const [sfdName, setSfdName] = useState("SFD Démo");
  
  const handleSfdSelect = (name: string) => {
    setSfdName(name);
    if (onSfdSelected) {
      onSfdSelected();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-4 flex items-center">
          <Building className="mr-2 h-4 w-4" />
          <span className="mr-1">{sfdName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => handleSfdSelect("SFD Démo")}>
          SFD Démo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSfdSelect("MicroFinance Plus")}>
          MicroFinance Plus
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSfdSelect("Crédit Rural")}>
          Crédit Rural
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
