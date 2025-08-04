import { Suspense } from 'react';
import LoginPageClient from './LoginPageClient';

function LoginPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>Loading...</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageClient />
    </Suspense>
  );
}
