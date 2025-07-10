import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { getDateStringFromNow } from '@/entry/types-constants';

// UI state types
export interface UIState {
  app: {
    dateStr: string;
  };
  entryPage: {};
  addPage: {
    isEntryTypeUpdating: boolean;
    updatingEntryTypeId: string | null;
    updatingReminderId: string | null;
  };
  reminderPage: {};
  settingsPage: {};
}

// Core UI state atom with localStorage persistence
export const uiStateAtom = atomWithStorage<UIState>('uiState', {
  app: {
    dateStr: getDateStringFromNow(),
  },
  entryPage: {},
  addPage: {
    isEntryTypeUpdating: false,
    updatingEntryTypeId: null,
    updatingReminderId: null,
  },
  reminderPage: {},
  settingsPage: {},
});

// Action atoms for UI state management
export const initDateStrAtom = atom(
  null,
  (get, set, payload: { dateStr: string }) => {
    const current = get(uiStateAtom);
    set(uiStateAtom, {
      ...current,
      app: {
        ...current.app,
        dateStr: payload.dateStr,
      },
    });
  }
);

export const enterEntryTypeEditAtom = atom(
  null,
  (get, set, payload: { entryTypeId: string }) => {
    const current = get(uiStateAtom);
    set(uiStateAtom, {
      ...current,
      addPage: {
        ...current.addPage,
        isEntryTypeUpdating: true,
        updatingEntryTypeId: payload.entryTypeId,
      },
    });
  }
);

export const enterReminderEditAtom = atom(
  null,
  (get, set, payload: { reminderId: string }) => {
    const current = get(uiStateAtom);
    set(uiStateAtom, {
      ...current,
      addPage: {
        ...current.addPage,
        updatingReminderId: payload.reminderId,
      },
    });
  }
);

export const exitEntryTypeEditAtom = atom(
  null,
  (get, set) => {
    const current = get(uiStateAtom);
    set(uiStateAtom, {
      ...current,
      addPage: {
        ...current.addPage,
        isEntryTypeUpdating: false,
        updatingEntryTypeId: null,
      },
    });
  }
);

export const exitReminderEditAtom = atom(
  null,
  (get, set) => {
    const current = get(uiStateAtom);
    console.log('exit', current);
    set(uiStateAtom, {
      ...current,
      addPage: {
        ...current.addPage,
        updatingReminderId: null,
      },
    });
  }
);

// Computed atoms for easy access
export const dateStrAtom = atom((get) => {
  const uiState = get(uiStateAtom);
  return uiState.app.dateStr;
});

export const isEntryTypeUpdatingAtom = atom((get) => {
  const uiState = get(uiStateAtom);
  return uiState.addPage.isEntryTypeUpdating;
});

export const updatingEntryTypeIdAtom = atom((get) => {
  const uiState = get(uiStateAtom);
  return uiState.addPage.updatingEntryTypeId;
});

export const updatingReminderIdAtom = atom((get) => {
  const uiState = get(uiStateAtom);
  return uiState.addPage.updatingReminderId;
});