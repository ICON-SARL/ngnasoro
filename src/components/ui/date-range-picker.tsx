
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  setDate: (date: DateRange) => void;
  className?: string;
}

export function DatePickerWithRange({
  date,
  setDate,
  className,
}: DatePickerWithRangeProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Quick select options
  const handleQuickSelect = (option: string) => {
    const today = new Date();
    let newRange: DateRange;

    switch (option) {
      case "today":
        newRange = {
          from: today,
          to: today,
        };
        break;
      case "yesterday":
        const yesterday = addDays(today, -1);
        newRange = {
          from: yesterday,
          to: yesterday,
        };
        break;
      case "last7days":
        newRange = {
          from: addDays(today, -6),
          to: today,
        };
        break;
      case "last30days":
        newRange = {
          from: addDays(today, -29),
          to: today,
        };
        break;
      case "thisMonth":
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        newRange = {
          from: firstDayOfMonth,
          to: today,
        };
        break;
      case "lastMonth":
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        newRange = {
          from: firstDayOfLastMonth,
          to: lastDayOfLastMonth,
        };
        break;
      default:
        return;
    }

    setDate(newRange);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-col">
        <div className="px-3 py-2 border-b">
          <div className="text-sm font-medium">Sélectionner une période</div>
          <div className="text-xs text-muted-foreground pt-1">
            Choisissez une période prédéfinie ou personnalisée
          </div>
        </div>
        <div className="p-3 border-b">
          <Select onValueChange={handleQuickSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Période prédéfinie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="last7days">7 derniers jours</SelectItem>
              <SelectItem value="last30days">30 derniers jours</SelectItem>
              <SelectItem value="thisMonth">Ce mois-ci</SelectItem>
              <SelectItem value="lastMonth">Mois dernier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="p-3">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
          locale={fr}
        />
      </div>
      <div className="p-3 border-t flex justify-end">
        <Button
          size="sm"
          onClick={() => setIsPopoverOpen(false)}
        >
          Appliquer
        </Button>
      </div>
    </div>
  );
}

// Add DateRangePicker export that references DatePickerWithRange
export const DateRangePicker = DatePickerWithRange;
