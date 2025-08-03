'use client';

import { useAutoBackup } from '@/hooks/useAutoBackup';

export default function AutoBackupManager() {
  useAutoBackup();
  return null;
}
