'use client';

import UserProfilePage from '@/components/auth/UserProfilePage';
import { ClientOnly } from '@/components/common/ClientOnly';

export default function SettingsPage() {
  return (
    <ClientOnly>
      <UserProfilePage />
    </ClientOnly>
  );
}
