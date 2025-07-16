'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import BackupDialog from '../app/BackupDialog';
export default function DialogComponents() {
  return (
    <ClientOnly>
      <BackupDialog />
    </ClientOnly>
  );
}
