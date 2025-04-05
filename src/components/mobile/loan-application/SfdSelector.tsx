
import React, { useState } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SfdSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  sfds: Array<{
    id: string;
    name: string;
    is_default?: boolean;
  }>;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ value, onValueChange, sfds }) => {
  const [open, setOpen] = useState(false);
  const selectedSfd = sfds?.find(sfd => sfd.id === value);

  // Ensure sfds is an array
  const safeSfds = Array.isArray(sfds) ? sfds : [];

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
          <CommandEmpty>Aucun SFD trouvé.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {safeSfds.map(sfd => (
                <CommandItem
                  key={sfd.id}
                  value={sfd.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === sfd.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {sfd.name}
                  {sfd.is_default && (
                    <span className="ml-auto text-xs text-muted-foreground">(Défaut)</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SfdSelector;
