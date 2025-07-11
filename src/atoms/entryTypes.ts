import { atom } from 'jotai';
import { EntryType } from '@/entry/types-constants';
import { toast } from 'react-toastify';
import { hybridEntryTypesAtom } from './databaseFirst';

// Core data atom with database-first approach
export const entryTypesArrayAtom = hybridEntryTypesAtom;

// Action atoms for managing entry types
export const createEntryTypeAtom = atom(
  null,
  (get, set, entryType: EntryType) => {
    const current = get(entryTypesArrayAtom);
    set(entryTypesArrayAtom, [...current, entryType]);
    toast.success(`Create ${entryType.title} successfully`);
  }
);

export const updateEntryTypeAtom = atom(
  null,
  (get, set, entryType: EntryType) => {
    const current = get(entryTypesArrayAtom);
    const indexToUpdate = current.findIndex((et: any) => et.id === entryType.id);
    if (indexToUpdate >= 0) {
      const updated = [...current];
      updated[indexToUpdate] = entryType;
      set(entryTypesArrayAtom, updated);
    }
  }
);

export const updateEntryTypeIdAtom = atom(
  null,
  (get, set, payload: { preEntryTypeId: string; changeEntryTypeId: string; newEntryType: EntryType }) => {
    const { preEntryTypeId, changeEntryTypeId, newEntryType } = payload;
    const { title, id, ...rest } = newEntryType;
    const current = get(entryTypesArrayAtom);
    const indexToUpdate = current.findIndex((et: any) => et.id === preEntryTypeId);
    
    if (indexToUpdate >= 0) {
      const updated = [...current];
      updated[indexToUpdate] = {
        ...updated[indexToUpdate],
        ...rest,
        id: changeEntryTypeId,
        title,
      };
      set(entryTypesArrayAtom, updated);
    }
  }
);

export const deleteEntryTypeAtom = atom(
  null,
  (get, set, entryTypeId: string) => {
    const current = get(entryTypesArrayAtom);
    const filtered = current.filter((et: any) => et.id !== entryTypeId);
    set(entryTypesArrayAtom, filtered);
  }
);

// Computed atoms
export const entryTypeIdsAtom = atom((get) => {
  const entryTypes = get(entryTypesArrayAtom);
  return entryTypes.map((entryType: any) => entryType.id);
});