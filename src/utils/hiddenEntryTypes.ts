const HIDDEN_ENTRY_TYPES_KEY = 'diary:hiddenEntryTypes';

export const getHiddenEntryTypes = (): Set<string> => {
  try {
    const stored = localStorage.getItem(HIDDEN_ENTRY_TYPES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

export const hideEntryType = (entryTypeId: string): void => {
  const hiddenTypes = getHiddenEntryTypes();
  hiddenTypes.add(entryTypeId);
  localStorage.setItem(HIDDEN_ENTRY_TYPES_KEY, JSON.stringify([...hiddenTypes]));
};

export const unhideEntryType = (entryTypeId: string): void => {
  const hiddenTypes = getHiddenEntryTypes();
  hiddenTypes.delete(entryTypeId);
  localStorage.setItem(HIDDEN_ENTRY_TYPES_KEY, JSON.stringify([...hiddenTypes]));
};

export const isEntryTypeHidden = (entryTypeId: string): boolean => {
  return getHiddenEntryTypes().has(entryTypeId);
};