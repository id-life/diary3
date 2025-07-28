'use client';

import { addDialogOpenAtom, entryTypeIdsAtom, entryTypesArrayAtom } from '@/atoms';
import { isEntryTypeUpdatingAtom, updatingEntryTypeIdAtom } from '@/atoms/uiState';
import { Segmented } from '@/components/segmented';
import { Button } from '@/components/ui/button';
import { EntryTypeConstructor, EntryTypeThemeColors, RoutineEnum } from '@/entry/types-constants';
import { useJotaiActions } from '@/hooks/useJotaiMigration';
import dayjs from 'dayjs';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Dialog from './index';

const DEFAULT_VALUES = {
  title: '',
  defaultPoints: 7,
  pointStep: 1,
  routine: RoutineEnum.daily,
  themeColor: EntryTypeThemeColors[0],
};

export default function AddDialog() {
  const [open, setOpen] = useAtom(addDialogOpenAtom);
  const isUpdate = useAtomValue(isEntryTypeUpdatingAtom);
  const updatingEntryTypeId = useAtomValue(updatingEntryTypeIdAtom);
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);
  const entryTypeIds = useAtomValue(entryTypeIdsAtom);

  // Find the updating entry type
  const updatingEntryType = updatingEntryTypeId ? entryTypesArray.find((et) => et.id === updatingEntryTypeId) || null : null;

  const [formData, setFormData] = useState(DEFAULT_VALUES);

  const { createEntryType, updateEntryType, updateEntryTypeId, updateChangeEntryIdEntryInstance, exitEntryTypeEdit } =
    useJotaiActions();

  // Update form data when entering edit mode or switching entry types
  useEffect(() => {
    if (isUpdate && updatingEntryType) {
      setFormData({
        title: updatingEntryType.title,
        defaultPoints: updatingEntryType.defaultPoints,
        pointStep: updatingEntryType.pointStep,
        routine: updatingEntryType.routine,
        themeColor: updatingEntryType.themeColor,
      });
    } else {
      setFormData(DEFAULT_VALUES);
    }
  }, [isUpdate, updatingEntryType]);

  // Auto-open dialog when entering edit mode
  useEffect(() => {
    if (isUpdate && updatingEntryTypeId) {
      setOpen(true);
    }
  }, [isUpdate, updatingEntryTypeId, setOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePointsChange = useCallback((field: 'defaultPoints' | 'pointStep', increment: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + (increment ? 1 : -1)),
    }));
  }, []);

  const handleRoutineSelect = useCallback((routine: RoutineEnum) => {
    setFormData((prev) => ({ ...prev, routine }));
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    setFormData((prev) => ({ ...prev, themeColor: color }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.title.trim()) {
      toast.error('Entry name is required');
      return;
    }

    // Generate ID from title
    const id = formData.title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/gi, '');

    const newEntryType = EntryTypeConstructor({
      ...formData,
      id,
    });

    if (isUpdate && updatingEntryType) {
      const { createdAt, id: originalId } = updatingEntryType;
      newEntryType.createdAt = createdAt ?? dayjs().valueOf();
      newEntryType.updatedAt = dayjs().valueOf();

      if (newEntryType.id !== originalId) {
        // Changed title/id - check if new ID exists (excluding current entry)
        if (entryTypeIds.filter((id) => id !== originalId).includes(newEntryType.id)) {
          toast.error('ID already exists');
          return;
        }
        updateChangeEntryIdEntryInstance({ preEntryTypeId: originalId, changeEntryTypeId: newEntryType.id });
        updateEntryTypeId(newEntryType);
      } else {
        updateEntryType(newEntryType);
      }
      exitEntryTypeEdit();
    } else {
      if (entryTypeIds.includes(id)) {
        toast.error('ID already exists');
        return;
      }
      createEntryType(newEntryType);
      setFormData(DEFAULT_VALUES); // Reset form
    }

    onClose();
  }, [
    formData,
    isUpdate,
    updatingEntryType,
    entryTypeIds,
    createEntryType,
    updateEntryType,
    updateEntryTypeId,
    updateChangeEntryIdEntryInstance,
    exitEntryTypeEdit,
    onClose,
  ]);

  const handleCancel = useCallback(() => {
    if (isUpdate) {
      exitEntryTypeEdit();
    }
    setFormData(DEFAULT_VALUES);
    onClose();
  }, [isUpdate, exitEntryTypeEdit, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      title={isUpdate ? 'Edit Entry' : 'Add Entry'}
      render={({ close }) => (
        <div className="flex flex-col gap-6 px-1">
          {/* Entry Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              <span className="text-red-500">*</span>Entry Name:
            </label>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="focus:ring-blue-500 h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2"
            />
          </div>

          {/* Default Points */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              <span className="text-red-500">*</span>Default Points:
            </label>
            <div className="flex h-10 w-[140px] items-center rounded-lg bg-gray-100">
              <button
                type="button"
                onClick={() => handlePointsChange('defaultPoints', false)}
                className="ml-2 flex h-6 w-6 items-center justify-center text-gray-600 hover:text-gray-800"
              >
                −
              </button>
              <div className="flex-1 text-center font-semibold text-gray-900">{formData.defaultPoints}</div>
              <button
                type="button"
                onClick={() => handlePointsChange('defaultPoints', true)}
                className="mr-2 flex h-6 w-6 items-center justify-center text-gray-600 hover:text-gray-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Point Step */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              <span className="text-red-500">*</span>PointStep:
            </label>
            <div className="flex h-10 w-[140px] items-center rounded-lg bg-gray-100">
              <button
                type="button"
                onClick={() => handlePointsChange('pointStep', false)}
                className="ml-2 flex h-6 w-6 items-center justify-center text-gray-600 hover:text-gray-800"
              >
                −
              </button>
              <div className="flex-1 text-center font-semibold text-gray-900">{formData.pointStep}</div>
              <button
                type="button"
                onClick={() => handlePointsChange('pointStep', true)}
                className="mr-2 flex h-6 w-6 items-center justify-center text-gray-600 hover:text-gray-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Entry Routine */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-900">
              <span className="text-red-500">*</span>Entry Routine:
            </label>
            <Segmented
              options={[
                { label: 'Daily', value: RoutineEnum.daily },
                { label: 'Weekly', value: RoutineEnum.weekly },
                { label: 'Monthly', value: RoutineEnum.monthly },
                { label: 'Adhoc', value: RoutineEnum.adhoc },
              ]}
              value={formData.routine}
              onChange={(value) => handleRoutineSelect(value as RoutineEnum)}
            />
          </div>

          {/* Entry Routine Colors */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-900">Entry Routine Colors:</label>
            <div className="flex flex-wrap gap-1">
              {EntryTypeThemeColors.map((color: string) => {
                const isSelected = formData.themeColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`flex size-[26px] items-center justify-center rounded-[4px] border`}
                    style={{
                      backgroundColor: isSelected ? `#${color}33` : 'transparent',
                      borderColor: isSelected ? `#${color}` : 'transparent',
                    }}
                  >
                    <div className="size-5 rounded-[4px]" style={{ backgroundColor: `#${color}` }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="primary" size="large" className="flex-1" onClick={handleSubmit}>
              {isUpdate ? 'Update' : 'Create'}
            </Button>
            {isUpdate && (
              <Button variant="secondary" size="large" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    />
  );
}
