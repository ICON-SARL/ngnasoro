
import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DatePickerProps = {
  /** The value of the date. */
  selected?: Date;
  /** Callback when date is changed. */
  onSelect?: (date: Date) => void;
  /** Ref for the input element. */
  inputRef?: React.RefObject<HTMLButtonElement>;
  /** Whether the popover should be disabled. */
  disabled?: boolean;
  /** The mode of the date picker */
  mode?: "single" | "range" | "multiple";
  /** Whether the picker should show the month and year selectors. */
  showMonthYearSelection?: boolean;
  /** The initial focus (used when mode is not "single") */
  initialFocus?: boolean;
};

/** A date picker component that allows users to select a date. */
export function DatePicker({
  selected,
  onSelect,
  inputRef,
  disabled,
  mode = "single",
  showMonthYearSelection = false,
  initialFocus
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(selected);
  const [month, setMonth] = React.useState<number>(date?.getMonth() || new Date().getMonth());
  const [year, setYear] = React.useState<number>(date?.getFullYear() || new Date().getFullYear());
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setDate(selected);
  }, [selected]);

  const handleSelect = (date: Date | undefined) => {
    setDate(date);
    if (date && onSelect) {
      onSelect(date);
    }
    if (mode === "single") {
      setIsOpen(false);
    }
  };

  const handleMonthChange = (value: string) => {
    setMonth(parseInt(value));
  };

  const handleYearChange = (value: string) => {
    setYear(parseInt(value));
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={inputRef}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {showMonthYearSelection && (
          <div className="flex gap-2 p-3">
            <Select value={month.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthIndex) => (
                  <SelectItem key={monthIndex} value={monthIndex.toString()}>
                    {format(new Date(2000, monthIndex, 1), "MMMM", { locale: fr })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Calendar
          mode={mode}
          defaultMonth={new Date(year, month)}
          month={new Date(year, month)}
          onMonthChange={(month) => {
            setMonth(month.getMonth());
            setYear(month.getFullYear());
          }}
          selected={date}
          onSelect={handleSelect}
          locale={fr}
          initialFocus={initialFocus}
        />
      </PopoverContent>
    </Popover>
  );
}

type DateRangePickerProps = {
  /** The value of the date range. */
  value?: DateRange;
  /** Callback when date range is changed. */
  onChange?: (value: DateRange) => void;
  /** Array of disabled dates. */
  disabled?: boolean;
  /** Whether to align with the field. */
  align?: "start" | "center" | "end";
};

/** A date range picker component that allows users to select a range of dates. */
export function DateRangePicker({
  value,
  onChange,
  disabled,
  align = "start",
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "P", { locale: fr })} -{" "}
                  {format(date.to, "P", { locale: fr })}
                </>
              ) : (
                format(date.from, "P", { locale: fr })
              )
            ) : (
              <span>Sélectionner une période</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(value) => {
              setDate(value);
              if (onChange) {
                onChange(value || { from: undefined, to: undefined });
              }
            }}
            numberOfMonths={2}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
