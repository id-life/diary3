'use client';

import { cloudBackupDialogOpenAtom } from '@/atoms/app';
import Button from '@/components/button';
import { ClientOnly } from '@/components/common/ClientOnly';
import GlobalStats from '@/components/my/GlobalStats';
import LoginForm from '@/components/my/LoginForm';
import { selectLoginUser, useAppSelector } from '@/entry/store';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { useSetAtom } from 'jotai';

export default function SettingsPage() {
  const loginUser = useAppSelector(selectLoginUser);
  const { isSignedIn, user } = useUser();
  const setCloudBackupOpen = useSetAtom(cloudBackupDialogOpenAtom);
  console.log({ loginUser, isSignedIn, user });

  return (
    <>
      <ClientOnly>{loginUser?.uid ? <GlobalStats /> : <LoginForm />}</ClientOnly>
      <SignedOut>
        <SignInButton>登录</SignInButton>
        <SignUpButton>注册</SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
        <Button
          size="large"
          className="h-12 rounded-full border-none hover:opacity-90"
          onClick={() => {
            setCloudBackupOpen(true);
          }}
          type="default"
        >
          查看云端备份
        </Button>
      </SignedIn>
    </>
  );
}
