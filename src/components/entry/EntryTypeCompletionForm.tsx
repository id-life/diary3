import { useCreateNewEntryInstance } from '@/hooks/entryType';
import { InputNumber } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { EntryType } from '../../entry/types-constants';
import Button from '../button';
import DiaryIcons from '../icon/DiaryIcons';

function EntryTypeCompletionForm(props: { entryType: EntryType; selectedDayStr?: string }) {
  const { selectedDayStr } = props;
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { points: props.entryType.defaultPoints, notes: '' },
  });
  const { createEntryInstanceWithDefaults } = useCreateNewEntryInstance(props.entryType);

  const onSubmit = (values: any) => {
    console.log('Completion Form Values: ', values, selectedDayStr);

    createEntryInstanceWithDefaults(selectedDayStr, values.points, values.notes);

    // Reset form after submission
    setValue('points', props.entryType.defaultPoints);
    setValue('notes', '');
  };

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={handleSubmit(onSubmit)}>
      <label className="flex flex-wrap items-center gap-2">
        Notes
        <textarea className="h-12 border bg-transparent p-2" {...register('notes')} rows={2} />
      </label>
      <label className="flex flex-wrap items-center gap-2">
        Points
        <Controller
          name="points"
          control={control}
          rules={{ required: 'points is required' }}
          render={({ field }) => (
            <InputNumber className="border bg-transparent p-2" type="number" step={props.entryType.pointStep} {...field} />
          )}
        />
        {errors?.points && <span className="text-red-500">{errors.points.message}</span>}
      </label>
      <Button htmlType="submit" type="unstyle" className="absolute left-4 top-4 flex w-10 items-center justify-center">
        <DiaryIcons.CheckSvg className="text-xl" />
      </Button>
    </form>
  );
}

export default EntryTypeCompletionForm;
