'use client';
import { StorageKey } from '@/constants/storage';
import { useAccessToken } from '@/hooks/app';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAccessToken } = useAccessToken();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Only use setAccessToken, it will handle localStorage properly
      setAccessToken(token);
      router.push('/settings');
      return;
    }
    console.log('no token');
    router.push('/entry');
  }, [searchParams, router, setAccessToken]);

  return <div></div>;
}
