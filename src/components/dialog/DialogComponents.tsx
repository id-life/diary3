'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import BackupDialog from '../app/BackupDialog';
import AddDialog from './AddDialog';

export default function DialogComponents() {
  return (
    <ClientOnly>
      <BackupDialog />
      <AddDialog />
    </ClientOnly>
  );
}
