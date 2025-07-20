'use client';

import { addDialogOpenAtom, entryTypeIdsAtom } from '@/atoms';
import { Button } from '@/components/ui/button';
import { EntryType, EntryTypeConstructor, EntryTypeThemeColors, RoutineEnum } from '@/entry/types-constants';
import { useJotaiActions } from '@/hooks/useJotaiMigration';
import dayjs from 'dayjs';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import Dialog from './index';

interface AddDialogProps {
  isUpdate?: boolean;
  updatingEntryType?: EntryType | null;
}

const DEFAULT_VALUES = {
  title: '',
  defaultPoints: 7,
  pointStep: 1,
  routine: RoutineEnum.daily,
  themeColors: EntryTypeThemeColors[0],
};

export default function AddDialog({ isUpdate = false, updatingEntryType }: AddDialogProps) {
  const [open, setOpen] = useAtom(addDialogOpenAtom);
  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_VALUES,
    ...(isUpdate && updatingEntryType
      ? {
          title: updatingEntryType.title,
          defaultPoints: updatingEntryType.defaultPoints,
          pointStep: updatingEntryType.pointStep,
          routine: updatingEntryType.routine,
          themeColors: updatingEntryType.themeColors,
        }
      : {}),
  }));

  const entryTypeIds = useAtomValue(entryTypeIdsAtom);
  const { createEntryType, updateEntryType, updateEntryTypeId, updateChangeEntryIdEntryInstance, exitEntryTypeEdit } =
    useJotaiActions();

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

  const handleColorSelect = useCallback((colorIndex: number) => {
    const selectedColor = EntryTypeThemeColors[colorIndex];
    setFormData((prev) => ({ ...prev, themeColors: selectedColor }));
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
        // Changed title/id
        if (entryTypeIds.includes(newEntryType.id)) {
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
      title="Add Entry"
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
            <div className="flex rounded-lg bg-gray-100 p-1">
              {[RoutineEnum.daily, RoutineEnum.weekly, RoutineEnum.monthly, RoutineEnum.adhoc].map((routine) => (
                <button
                  key={routine}
                  type="button"
                  onClick={() => handleRoutineSelect(routine)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    formData.routine === routine ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {routine.charAt(0).toUpperCase() + routine.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Entry Routine Colors */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-900">Entry Routine Colors:</label>
            <div className="flex flex-wrap gap-3">
              {EntryTypeThemeColors.map((themeColorPair: string[], index: number) => {
                const [color1, color2] = themeColorPair;
                const isSelected = formData.themeColors[0] === color1 && formData.themeColors[1] === color2;
                return (
                  <button
                    key={`${themeColorPair[0]}-${themeColorPair[1]}`}
                    type="button"
                    onClick={() => handleColorSelect(index)}
                    className={`flex-center size-6.5 rounded transition duration-300 ${isSelected ? 'border' : ''}`}
                    style={{
                      borderColor: isSelected ? `#${color1}` : 'transparent',
                      backgroundColor: isSelected ? `#${color1}33` : 'transparent',
                    }}
                  >
                    <div
                      className="size-5 rounded-[3px] transition duration-300"
                      style={{ background: `linear-gradient(90deg, #${themeColorPair[0]} 0%, #${themeColorPair[1]} 100%)` }}
                    ></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create Button */}
          <Button variant="primary" size="large" onClick={handleSubmit}>
            {isUpdate ? 'Update' : 'Create'}
          </Button>
        </div>
      )}
    />
  );
}
