'use client';

import Button from '@/components/button';
import { ClientOnly } from '@/components/common/ClientOnly';
import GlobalStats from '@/components/my/GlobalStats';
import LoginForm from '@/components/my/LoginForm';
import { selectLoginUser, useAppSelector } from '@/entry/store';
import { cloudBackupDialogOpenAtom } from '@/store/app';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import clsx from 'clsx';
import { useSetAtom } from 'jotai';

export default function SettingsPage() {
  const loginUser = useAppSelector(selectLoginUser);
  const { isSignedIn, user } = useUser();
  const setCloudBackupOpen = useSetAtom(cloudBackupDialogOpenAtom);
  console.log({ loginUser, isSignedIn, user });

  return (
    <div className={clsx('flex h-full flex-col items-center justify-end gap-4 bg-gradient-home px-5 py-10 text-center')}>
      <ClientOnly>{loginUser?.uid ? <GlobalStats /> : <LoginForm />}</ClientOnly>
      <SignedOut>
        <SignInButton>登录</SignInButton>
        <SignUpButton>注册</SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />

        <Button
          onClick={() => {
            setCloudBackupOpen(true);
          }}
          type="default"
        >
          查看云端备份
        </Button>
      </SignedIn>
    </div>
  );
}
