import Theme from '@/components/app/Theme';
import { ClientOnly } from '@/components/common/ClientOnly';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import DialogComponents from '@/components/dialog/DialogComponents';
import GlobalClientComp from '@/components/layout/GlobalClientComp';
import Header from '@/components/layout/Header';
import Providers from '@/providers/root';
import { ddin, poppins } from '@/styles/fonts';
import { ClerkProvider } from '@clerk/nextjs';
import { clsx } from 'clsx';
import type { Metadata, Viewport } from 'next';
import { ToastContainer } from 'react-toastify';

import '@/styles/globals.css';

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
            {/* <div className={cn('flex h-[100dvh] flex-col overflow-hidden')}> */}
            <ErrorBoundary>
              {/* <Navbar /> */}
              <main className="min-h-screen bg-gradient-to-br from-white to-purple-100">
                <Header />
                {children}
                <ClientOnly>
                  <GlobalClientComp />
                </ClientOnly>
              </main>
            </ErrorBoundary>
            <DialogComponents />
            {/* </div> */}
            <ToastContainer autoClose={3000} position="top-center" />
            <Theme />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
