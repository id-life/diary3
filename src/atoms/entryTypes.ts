import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { EntryType } from '@/entry/types-constants';
import { toast } from 'react-toastify';

// Core data atom with localStorage persistence
export const entryTypesArrayAtom = atomWithStorage<EntryType[]>('entryTypes.entryTypesArray', []);

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
    const indexToUpdate = current.findIndex((et) => et.id === entryType.id);
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
    const indexToUpdate = current.findIndex((et) => et.id === preEntryTypeId);
    
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
    const filtered = current.filter((et) => et.id !== entryTypeId);
    set(entryTypesArrayAtom, filtered);
  }
);

// Computed atoms
export const entryTypeIdsAtom = atom((get) => {
  const entryTypes = get(entryTypesArrayAtom);
  return entryTypes.map((entryType) => entryType.id);
});