
import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SFD {
  id: string;
  name: string;
  is_default?: boolean;
}

interface SfdSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  sfds: SFD[];
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ value, onValueChange, sfds = [] }) => {
  const [open, setOpen] = React.useState(false);

  // Ensure sfds is always an array
  const safeSfds = Array.isArray(sfds) ? sfds : [];
  
  // Find the selected SFD
  const selectedSfd = safeSfds.find(sfd => sfd.id === value);

  // Extra safeguard to ensure we don't pass undefined to Command components
  if (!Array.isArray(safeSfds) || safeSfds.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between"
        disabled
      >
        Aucune SFD disponible
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedSfd ? selectedSfd.name : "Sélectionner une SFD..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Rechercher une SFD..." />
          <CommandEmpty>Aucune SFD trouvée.</CommandEmpty>
          <CommandGroup>
            {safeSfds.length > 0 ? (
              safeSfds.map((sfd) => (
                <CommandItem
                  key={sfd.id}
                  value={sfd.id}
                  onSelect={() => {
                    onValueChange(sfd.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === sfd.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{sfd.name}</span>
                  {sfd.is_default && (
                    <span className="ml-2 text-xs text-[#0D6A51] bg-[#0D6A51]/10 px-2 py-0.5 rounded-full">
                      Par défaut
                    </span>
                  )}
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>Aucune SFD disponible</CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SfdSelector;
