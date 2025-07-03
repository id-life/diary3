'use client';

import EntryTypeForm from '@/components/entry/EntryTypeForm';
import StreaksTable from '@/components/entry/StreaksTable';
import { Sidebar } from '@/components/layout/sidebar';
import { selectEntryTypeIds, selectEntryTypesArray, useAppSelector } from '@/entry/store';
import { RoutineEnum } from '@/entry/types-constants';

export default function AddPage() {
  const entryTypesArray = useAppSelector(selectEntryTypesArray);
  const entryTypeIds = useAppSelector(selectEntryTypeIds);
  const isUpdate = useAppSelector((state) => state.uiState.addPage.isEntryTypeUpdating);
  const updatingEntryTypeId = useAppSelector((state) => state.uiState.addPage.updatingEntryTypeId);
  const updatingEntryType =
    isUpdate && updatingEntryTypeId ? entryTypesArray.find((entryType) => entryType.id === updatingEntryTypeId) : null;
  console.log({ entryTypesArray });
  return (
    <div className="container relative mt-20 flex h-screen items-start gap-5 overflow-auto text-center">
      <Sidebar />
      <div className="flex flex-col items-center gap-8 pt-4">
        <EntryTypeForm isUpdate={isUpdate} updatingEntryType={updatingEntryType} entryTypeIds={entryTypeIds} />
        <StreaksTable entryTypesArray={entryTypesArray} routine={RoutineEnum.daily} />
        <StreaksTable entryTypesArray={entryTypesArray} routine={RoutineEnum.weekly} />
        <StreaksTable entryTypesArray={entryTypesArray} routine={RoutineEnum.monthly} />
        <StreaksTable entryTypesArray={entryTypesArray} routine={RoutineEnum.adhoc} />
      </div>
    </div>
  );
}
