'use client';

import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate } from '@/utils/date';

interface DatePickerProps {
  value?: string | null;
  onChange?: (date: string | null) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Convert string value to Date object
  const dateValue = value ? new Date(value) : undefined;
  const [month, setMonth] = React.useState<Date | undefined>(dateValue || new Date());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1 whitespace-nowrap bg-background px-[9px] py-3">
          <CalendarIcon className="size-5" />
          {value}
          <span className="sr-only">Select date</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
        <Calendar
          mode="single"
          selected={dateValue}
          captionLayout="dropdown"
          month={month}
          onMonthChange={setMonth}
          onSelect={(date) => {
            console.log('=========onSelect', date);
            if (date) {
              onChange?.(formatDate(date));
            } else {
              onChange?.(null);
            }
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
