import { createStore } from 'jotai';

const jotaiStore = createStore();

export { jotaiStore };

// Re-export all atoms from their respective files
export * from './app';
export * from './user';
export * from './entryTypes';
export * from './entryInstances';
export * from './reminderRecords';
export * from './uiState';
