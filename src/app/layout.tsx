import Theme from '@/components/app/Theme';
import { ClientOnly } from '@/components/common/ClientOnly';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Providers from '@/providers/root';
import { ddin, poppins } from '@/styles/fonts';
import { cn } from '@/utils';
import { clsx } from 'clsx';
import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import type { Viewport } from 'next';
import DialogComponents from '@/components/dialog/DialogComponents';

import '@/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Diary',
  description: 'Time is your most valuable asset till immortality',
  keywords: ['Diary', 'Time'],
  manifest: '/manifest.json',
  icons: {
    apple: '/favicon.ico',
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Diary',
    siteName: 'Diary',
    description: 'Time is your most valuable asset till immortality',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={clsx(poppins.variable, ddin.variable)} suppressHydrationWarning>
          <Providers>
            <div className={cn('flex h-[100dvh] flex-col overflow-hidden')}>
              <ErrorBoundary>
                <ClientOnly>
                  <Header />
                </ClientOnly>
                <main className="min relative flex-grow overflow-auto scroll-smooth bg-[#F6F6F6]">{children}</main>
              </ErrorBoundary>
              <Navbar />
              <DialogComponents />
            </div>
            <ToastContainer autoClose={3000} position="top-center" />
            <Theme />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
