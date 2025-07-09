'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import GithubLoadDialog from '../app/GithubLoadDialog';
import BackupDialog from '../app/BackupDialog';
export default function DialogComponents() {
  return (
    <ClientOnly>
      <GithubLoadDialog />
      <BackupDialog />
    </ClientOnly>
  );
}
