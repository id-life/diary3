'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import GithubLoadDialog from '../app/GithubLoadDialog';
export default function DialogComponents() {
  return (
    <ClientOnly>
      <GithubLoadDialog />
    </ClientOnly>
  );
}
