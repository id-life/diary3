'use client';
import { useAccessToken } from '@/hooks/app';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

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
    router.push('/entry');
  }, [searchParams, router, setAccessToken]);

  return <div></div>;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
