import { useJotaiActions } from '@/hooks/useJotaiMigration';
import { Form, Input, InputNumber, Radio } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { EntryType, EntryTypeConstructor, EntryTypeThemeColors, RoutineEnum } from '../../entry/types-constants';
import DiaryIcons from '../icon/DiaryIcons';
import { Button } from '../ui/button';

const addInitialValues = {
  routine: RoutineEnum.adhoc,
  themeColors: JSON.stringify(EntryTypeThemeColors[0]),
  defaultPoints: 1,
  pointStep: 0,
  id: '',
  title: '',
};

const EntryTypeForm = (props: { isUpdate: boolean; updatingEntryType?: null | EntryType; entryTypeIds: string[] }) => {
  const [form] = Form.useForm();
  // TODO: Replace with direct atom usage
  const { createEntryType, updateEntryType, updateEntryTypeId, updateChangeEntryIdEntryInstance, exitEntryTypeEdit } =
    useJotaiActions();

  const onValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.title) {
      // replace non-alphanumeric characters in title with hyphens
      const id = changedValues.title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/gi, '');
      form.setFieldsValue({ id });
    }
  };

  const onFinish = (values: any) => {
    console.log('Success:', values);
    values.themeColors = JSON.parse(values.themeColors);
    const newEntryType = EntryTypeConstructor(values);
    const { updatingEntryType, isUpdate, entryTypeIds } = props;
    if (isUpdate) {
      const { createdAt, id } = updatingEntryType!;
      newEntryType.createdAt = createdAt ?? dayjs().valueOf();
      newEntryType.updatedAt = dayjs().valueOf();
      if (newEntryType.id !== id) {
        // changed title - check if new ID exists (excluding current entry)
        if (entryTypeIds.filter(existingId => existingId !== id).includes(newEntryType.id)) {
          toast.error('id already exists');
          return;
        }
        updateChangeEntryIdEntryInstance({ preEntryTypeId: id, changeEntryTypeId: newEntryType.id });
        updateEntryTypeId(newEntryType);
        exitEntryTypeEdit();
        console.log('change id ==== preEntryType', updatingEntryType, ' newEntryType', newEntryType);
        return;
      }
      console.log('preEntryType', updatingEntryType, ' newEntryType', newEntryType);

      updateEntryType(newEntryType);
      exitEntryTypeEdit();
    } else {
      createEntryType(newEntryType);
      form.resetFields();
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const onCancelUpdateClick = () => {
    exitEntryTypeEdit();
  };
  const entryTypeThemeColorsRadios = useMemo(
    () =>
      EntryTypeThemeColors.map((themeColorPair) => {
        const value = JSON.stringify(themeColorPair);
        return (
          <Radio.Button
            key={themeColorPair[0]}
            style={{
              background: `linear-gradient(90deg, #${themeColorPair[0]} 0%, #${themeColorPair[1]} 100%)`,
              borderRadius: '9999px',
            }}
            className="relative w-7 appearance-none rounded-full border-2 border-solid border-neutral-300 bg-origin-padding before:pointer-events-none before:absolute before:h-6 before:w-6 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_8px_transparent] before:content-[''] checked:border-blue checked:before:opacity-[0.16] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_8px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_8px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-blue checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_8px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s]"
            type="radio"
            name="themeColors"
            id={themeColorPair[0]}
            value={value}
          />
        );
      }),
    [],
  );

  useEffect(() => {
    if (props.isUpdate) {
      form.setFieldsValue({
        ...props.updatingEntryType,
        themeColors: props.updatingEntryType ? JSON.stringify(props.updatingEntryType.themeColors) : '',
      });
    } else {
      form.setFieldsValue(addInitialValues);
    }
  }, [props.isUpdate, props.updatingEntryType, form]);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-medium">Add Entry</h1>
      <Form
        className="flex flex-col gap-2"
        name="entry-type-form"
        form={form}
        initialValues={addInitialValues}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={onValuesChange}
      >
        <Form.Item
          name="id"
          label="ID"
          rules={[
            { required: true, message: 'id is required' },
            {
              validator: (_, id) => {
                if (props.isUpdate) {
                  return Promise.resolve();
                } else {
                  return props.entryTypeIds.includes(id) ? Promise.reject('id already exists') : Promise.resolve();
                }
              },
            },
          ]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'title is required' }]}>
          <Input placeholder="Title" prefix={<DiaryIcons.EditSvg />} />
        </Form.Item>

        <div className="flex items-center gap-4">
          <Form.Item
            name="defaultPoints"
            label="DefaultPoints"
            rules={[{ required: true, message: 'defaultPoints is required' }]}
          >
            <InputNumber min={-60} max={60} step={0.5} size="large" />
          </Form.Item>
          <Form.Item name="pointStep" label="PointStep" rules={[{ required: true, message: 'pointStep is required' }]}>
            <InputNumber min={0} max={60} step={0.5} size="large" />
          </Form.Item>
        </div>

        <Form.Item name="routine" label="Routine" rules={[{ required: true, message: 'routine is required' }]}>
          <Radio.Group>
            <Radio.Button key={RoutineEnum.adhoc} value={RoutineEnum.adhoc}>
              {RoutineEnum.adhoc}
            </Radio.Button>
            <Radio.Button key={RoutineEnum.daily} value={RoutineEnum.daily}>
              {RoutineEnum.daily}
            </Radio.Button>
            <Radio.Button key={RoutineEnum.weekly} value={RoutineEnum.weekly}>
              {RoutineEnum.weekly}
            </Radio.Button>
            <Radio.Button key={RoutineEnum.monthly} value={RoutineEnum.monthly}>
              {RoutineEnum.monthly}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="themeColors" label="themeColors" rules={[{ required: true, message: 'themeColors is required' }]}>
          <Radio.Group className="flex flex-wrap items-center gap-3">{entryTypeThemeColorsRadios}</Radio.Group>
        </Form.Item>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button variant="primary" className="rounded-full font-bold" size="large" htmlType="submit">
            <DiaryIcons.EditSvg /> {props.isUpdate ? 'Update' : 'Create'}
          </Button>
          {props.isUpdate && (
            <Button size="large" className="rounded-full font-bold" onClick={onCancelUpdateClick}>
              Cancel
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default EntryTypeForm;
