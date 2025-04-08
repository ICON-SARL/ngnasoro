
import * as React from "react";
import { Check, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxItem {
  value: string;
  label: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Sélectionner...",
  emptyMessage = "Aucun résultat trouvé.",
  searchPlaceholder = "Rechercher...",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  
  // Find the label for the currently selected value
  const selectedItem = React.useMemo(() => 
    items.find(item => item.value === value),
    [items, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value && selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => {
                  onChange(item.value === value ? "" : item.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
