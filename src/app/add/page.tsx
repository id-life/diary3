'use client';

import EntryTypeForm from '@/components/entry/EntryTypeForm';
import StreaksTable from '@/components/entry/StreaksTable';
import { RoutineEnum } from '@/entry/types-constants';
import { entryTypesArrayAtom, entryTypeIdsAtom, uiStateAtom } from '@/atoms';
import { useAtomValue } from 'jotai';

export default function AddPage() {
  const entryTypesArray = useAtomValue(entryTypesArrayAtom);
  const entryTypeIds = useAtomValue(entryTypeIdsAtom);
  const uiState = useAtomValue(uiStateAtom);
  const isUpdate = uiState.addPage.isEntryTypeUpdating;
  const updatingEntryTypeId = uiState.addPage.updatingEntryTypeId;
  const updatingEntryType =
    isUpdate && updatingEntryTypeId ? entryTypesArray.find((entryType: any) => entryType.id === updatingEntryTypeId) : null;
  console.log({ entryTypesArray });
  return (
    <div className="flex h-full flex-col items-center gap-8 overflow-auto px-4 py-6 text-center">
      <EntryTypeForm isUpdate={isUpdate} updatingEntryType={updatingEntryType} entryTypeIds={entryTypeIds} />
      <StreaksTable entryTypesArray={entryTypesArray} routine={RoutineEnum.daily} />
      <StreaksTable entryTypesArray={entryTypesArray} routine={RoutineEnum.weekly} />
      <StreaksTable entryTypesArray={entryTypesArray} routine={RoutineEnum.monthly} />
      <StreaksTable entryTypesArray={entryTypesArray} routine={RoutineEnum.adhoc} />
    </div>
  );
}
