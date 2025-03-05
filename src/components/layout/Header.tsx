import Link from 'next/link';
import { LogoSvg } from '../icon';

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b bg-white">
      <div className="container flex h-20 items-center gap-20 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <LogoSvg className="size-12" />
          <span className="text-xl/6 font-bold">Diary</span>
        </Link>
        <nav className="flex gap-6">
          <Link href="/entry" className="text-sm/4 font-medium">
            Entry
          </Link>
          <Link href="/add" className="text-sm/4 font-medium">
            Add
          </Link>
          <Link href="/reminder" className="text-sm/4 font-medium">
            Reminder
          </Link>
          <Link href="/settings" className="text-sm/4 font-medium">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
