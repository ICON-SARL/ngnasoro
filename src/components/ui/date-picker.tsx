
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { fr } from "date-fns/locale"

export function DatePicker({
  selected,
  onSelect,
  mode = "single",
  className,
  ...props
}: {
  selected?: Date;
  onSelect?: (date: Date) => void;
  mode?: "single" | "multiple" | "range";
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">) {
  const [date, setDate] = React.useState<Date | undefined>()

  React.useEffect(() => {
    if (selected) {
      setDate(selected)
    }
  }, [selected])

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      onSelect && onSelect(selectedDate)
    }
  }

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function DateRangePicker({
  value,
  onChange,
  className,
  align = "end",
}: {
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
  className?: string;
  align?: "center" | "start" | "end";
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(value)

  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    onChange && onChange(range)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
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
            mode="range"
            selected={date}
            onSelect={handleSelect}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
