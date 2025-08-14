import { ReminderConstructor, ReminderRecord, ReminderType } from '@/entry/types-constants';
import { cn } from '@/utils';
import { useJotaiSelectors, useJotaiActions } from '@/hooks/useJotaiMigration';
import { formatDate } from '@/utils/date';
import { zodResolver } from '@hookform/resolvers/zod';
import 'add-to-calendar-button-react';
import dayjs from 'dayjs';
import { range } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { AiFillCalendar } from 'react-icons/ai';
import { z } from 'zod';
import { Button } from '../ui/button';
import Segmented from '../segmented';
import { Calendar } from '../ui/calendar';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Switch } from '../ui/switch';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  title: z.string().trim().min(1, { message: 'This field cannot be empty. Please fill it in.' }),
  content: z.string().optional(),
  isSendReminderEmail: z.boolean().optional(),
  sinceStartTime: z.date().optional(),
});

const options = [
  { value: ReminderType.weekly },
  { value: ReminderType.monthly },
  { value: ReminderType.annual },
  { value: ReminderType.since },
];

export default function ReminderAddForm() {
  const router = useRouter();
  const [type, setType] = useState<ReminderType>(ReminderType.weekly);

  const [weekOpt, setWeekOpt] = useState<number>(0);
  const [monthDayOpt, setMonthDayOpt] = useState<number>(0);
  const [yearMonthOpt, setYearMonthOpt] = useState<number>(0);

  const { uiState, reminderRecords } = useJotaiSelectors();
  const { createReminder, updateReminder, exitReminderEdit } = useJotaiActions();
  const updatingReminderId = uiState.addPage.updatingReminderId;
  const updatingReminder = useMemo(
    () => reminderRecords.find((reminder: any) => reminder.id === updatingReminderId),
    [reminderRecords, updatingReminderId],
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      content: '',
      isSendReminderEmail: false,
      sinceStartTime: new Date(),
    },
  });

  useEffect(() => {
    if (!updatingReminderId || !updatingReminder) {
      form.reset();
      return;
    }
    form.setValue('title', updatingReminder?.title ?? '');
    form.setValue('content', updatingReminder?.content);
    form.setValue('sinceStartTime', updatingReminder?.sinceStartTime ? new Date(updatingReminder.sinceStartTime) : undefined);
    form.setValue('isSendReminderEmail', !!updatingReminder?.isSendReminderEmail);
    setWeekOpt(updatingReminder?.weekDay ?? 0);
    setMonthDayOpt(updatingReminder?.monthDay ?? 0);
    setYearMonthOpt(updatingReminder?.month ?? 0);
    setType(updatingReminder?.type ?? ReminderType.weekly);
  }, [form, updatingReminder, updatingReminderId]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const submitData: ReminderRecord = ReminderConstructor({
      ...data,
      id: updatingReminderId ?? undefined,
      type,
      weekDay: type === ReminderType.weekly ? weekOpt : undefined,
      monthDay: type === ReminderType.monthly ? monthDayOpt : undefined,
      month: type === ReminderType.annual ? yearMonthOpt : undefined,
      sinceStartTime: type === ReminderType.since ? data?.sinceStartTime?.valueOf() : undefined,
    });

    if (!updatingReminderId) {
      createReminder(submitData);
    } else {
      updateReminder(submitData);
    }

    router.push('/reminder');
  }

  const onCancel = useCallback(() => {
    exitReminderEdit();
    router.push('/reminder');
  }, [exitReminderEdit, router]);

  const { startDate, recurrenceRule } = useMemo(() => {
    if (type === ReminderType.weekly)
      return {
        startDate: dayjs().day(weekOpt).format('YYYY-MM-DD'),
        recurrenceRule: `RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${dayjs().day(weekOpt).format('dd').toUpperCase()}`,
      };
    if (type === ReminderType.monthly)
      return {
        startDate: dayjs()
          .date(monthDayOpt + 1)
          .format('YYYY-MM-DD'),
        recurrenceRule: `RRULE:FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=${monthDayOpt + 1}`,
      };
    if (type === ReminderType.annual)
      return {
        startDate: dayjs().month(yearMonthOpt).format('YYYY-MM-DD'),
        recurrenceRule: `RRULE:FREQ=YEARLY;INTERVAL=1;BYMONTH=${yearMonthOpt + 1};BYDAY=1MO`,
      };
    return {};
  }, [monthDayOpt, type, weekOpt, yearMonthOpt]);

  const renderPushConfig = useCallback(() => {
    const weekOpts = range(0, 7).map((value) => ({
      label: dayjs().day(value).format('ddd'),
      value,
    }));
    const monthDayOpts = range(0, 31).map((value) => ({
      label: (value + 1).toString(),
      value,
    }));
    const yearMonthOpts = range(0, 12).map((value) => ({
      label: dayjs().month(value).format('MMM'),
      value,
    }));

    return (
      <>
        {type === ReminderType.weekly && (
          <FormItem>
            <FormLabel>Week Day:</FormLabel>
            <FormControl>
              <Segmented
                value={weekOpt}
                onChange={(value) => {
                  setWeekOpt(value as number);
                }}
                optionClass="w-10 px-0"
                options={weekOpts}
              />
            </FormControl>
          </FormItem>
        )}
        {type === ReminderType.monthly && (
          <FormItem>
            <FormLabel>Month Day</FormLabel>
            <FormControl>
              <Segmented
                className="grid grid-cols-7 bg-background text-center"
                optionClass="w-16"
                value={monthDayOpt}
                onChange={(value) => {
                  setMonthDayOpt(value as number);
                }}
                options={monthDayOpts}
              />
            </FormControl>
          </FormItem>
        )}
        {type === ReminderType.annual && (
          <FormItem>
            <FormLabel>Yearly (Select Month)</FormLabel>
            <FormControl>
              <Segmented
                className="grid grid-cols-7 bg-background text-center"
                optionClass="w-16"
                value={yearMonthOpt}
                onChange={(value) => {
                  setYearMonthOpt(value as number);
                }}
                options={yearMonthOpts}
              />
            </FormControl>
          </FormItem>
        )}
        {type === ReminderType.since && (
          <FormField
            control={form.control}
            name="sinceStartTime"
            render={({ field }) => (
              <FormItem className="mt-2 flex flex-col">
                <FormLabel>Date of Since Reminder</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        htmlType="button"
                        className={cn(
                          'flex w-[240px] items-center justify-between rounded-lg',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? formatDate(field.value) : <span>Pick a date</span>}
                        <AiFillCalendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      required
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Recording from that time.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {type !== ReminderType.since && (
          <FormField
            control={form.control}
            name="isSendReminderEmail"
            render={({ field }) => (
              <FormItem className="mt-2 flex flex-col">
                <FormLabel className="leading-5">Send Reminder Email:</FormLabel>
                <FormControl className="mt-2">
                  <Switch size="large" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </>
    );
  }, [form.control, monthDayOpt, type, weekOpt, yearMonthOpt]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col gap-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="text-red-500">*</span>Title:
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter your title here" {...field} />
              </FormControl>
              <FormMessage style={{ marginTop: '.125rem' }} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content:</FormLabel>
              <FormControl>
                <Input placeholder="Enter your content here" {...field} />
              </FormControl>
              <FormMessage style={{ marginTop: '.125rem' }} />
            </FormItem>
          )}
        />
        <div className="flex flex-wrap items-start gap-4">
          <FormItem>
            <FormLabel>Type:</FormLabel>
            <FormControl>
              <Segmented
                options={options}
                value={type}
                onChange={(value) => {
                  setType(value as ReminderType);
                }}
              />
            </FormControl>
          </FormItem>
          {renderPushConfig()}
        </div>
        <div className="mx-6 mb-10 mt-auto space-y-4">
          <div className="text-center text-xs text-[#8A8998]">Defaults to 8pm, 15 minute reminder events</div>
          <div className="flex items-center justify-center">
            {updatingReminderId !== null ? (
              <Button
                size="large"
                className="mr-4 h-[40px] flex-1 rounded-[8px] border-primary/10"
                htmlType="button"
                onClick={onCancel}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="large"
              className="h-[40px] w-full flex-1 rounded-[8px] py-0 leading-[14px]"
              htmlType="submit"
            >
              {updatingReminderId !== null ? 'Update' : 'Submit'}
            </Button>

            {startDate && form.getValues('title') && (
              <add-to-calendar-button
                name={form.getValues('title') || 'Reminder'}
                description={form.getValues('content') || ''}
                startDate={startDate}
                recurrence={recurrenceRule}
                startTime="20:00"
                endTime="20:15"
                options="'Apple','Google','iCal'"
                identifier="reminder-calendar-btn"
                listStyle="dropup-static"
                hideBranding={true}
                hideBackground={false}
                hideIconButton
                // hideIconList
                // customLabels={`{
                //   "apple": "<img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij4KPHJlY3RhbmdlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgc3R5bGU9ImZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==' alt='Apple icon' /> Apple is 1212ok for me",
                //   "google": "<img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij4KPHJlY3RhbmdlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgc3R5bGU9ImZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==' alt='Google icon' /> Add to 111222Google Cal",
                //   "ical": "<img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij4KPHJlY3RhbmdlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgc3R5bGU9ImZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==' alt='iCal icon' /> iCall ftw!"
                // }`}
                trigger="click"
                styleLight={`
                  --btn-background: #fff;
                  --btn-padding-x: 22px;
                  --btn-padding-y: 0;
                  --btn-border: #1E1B391A;
                  --btn-border-radius: 8px;
                  --btn-shadow: none !important;
                  --btn-hover-shadow: none !important;
                  --btn-active-shadow: none !important;

                  --list-background: #fff;
                  --list-hover-background: #f6f6f7;
                  --list-border-radius: 8px;
                  --list-padding: 10px;
                  --list-width: 100px; 
                  --list-font-weight: 600;
                  --list-shadow: none !important;
                  --list-modal-shadow: none !important;
                  --list-text: #1E1B39;

                  --base-font-size-l: 14px;
                  --base-font-size-m: 14px;
                  --base-font-size-s: 14px;
                  
                  --modal-btn-shadow: none !important;
                  --modal-btn-hover-shadow: none !important;

                  --overlay-background: #00000099;
                  --wrapper-padding: 0;
                `}
              ></add-to-calendar-button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
