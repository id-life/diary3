'use client';
import { StorageKey } from '@/constants/storage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('token')) {
      console.log('token:', searchParams.get('token'));
      localStorage.setItem(StorageKey.AUTH_TOKEN, searchParams.get('token') as string);
      router.push('/settings');
      return;
    }
    router.push('/entry');
  }, [searchParams, router]);

  return <div></div>;
}
