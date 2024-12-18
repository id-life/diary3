import { Poppins } from 'next/font/google';
import localFont from 'next/font/local';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const ddin = localFont({
  src: './font/D-DIN-Bold.ttf',
  variable: '--font-ddin',
  weight: '700',
});

export { poppins, ddin };
