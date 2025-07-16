'use client';
import { ClientOnly } from '@/components/common/ClientOnly';
import EntryPageContent from '@/components/entry/EntryPageContent';
import { useAccessToken } from '@/hooks/app';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function HomePageContent() {
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
  }, [searchParams, router, setAccessToken]);
  return <EntryPageContent />;
}

export default function HomePage() {
  return (
    <ClientOnly>
      <HomePageContent />
    </ClientOnly>
  );
}
