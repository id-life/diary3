'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import GlobalStats from '@/components/my/GlobalStats';
import LoginForm from '@/components/my/LoginForm';
import { selectLoginUser, useAppSelector } from '@/entry/store';
import clsx from 'clsx';

export default function SettingsPage() {
  const loginUser = useAppSelector(selectLoginUser);
  console.log({ loginUser });
  return (
    <div className={clsx('flex h-full flex-col items-center justify-end gap-4 bg-gradient-home px-5 py-10 text-center')}>
      <ClientOnly>{loginUser?.uid ? <GlobalStats /> : <LoginForm />}</ClientOnly>
    </div>
  );
}
