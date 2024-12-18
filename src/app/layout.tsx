import Providers from '@/providers/root';
import { ddin, poppins } from '@/styles/fonts';
import { clsx } from 'clsx';
import type { Metadata } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Diary',
  description: 'Time is your most valuable asset till immortality',
  keywords: ['Diary', 'Time'],
  openGraph: {
    title: 'Diary',
    siteName: 'Diary',
    description: 'Time is your most valuable asset till immortality',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={clsx(poppins.variable, ddin.variable)} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
