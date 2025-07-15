'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { act, createElement, FC, SVGProps, useMemo } from 'react';
import DiaryIcons from '../icon/DiaryIcons';
import { useInitGlobalState } from '@/hooks/app';

export const PAGES: { key: string; icon: FC<SVGProps<SVGElement>> }[] = [
  { key: 'entry', icon: DiaryIcons.HomeSvg },
  {
    key: 'add',
    icon: DiaryIcons.AddSvg,
  },
  {
    key: 'reminder',
    icon: DiaryIcons.ReminderSvg,
  },
  {
    key: 'settings',
    icon: DiaryIcons.SettingsSvg,
  },
];

function Navbar() {
  const pathname = usePathname();
  const activeKey = useMemo(() => {
    if (!pathname) return '';
    const path = pathname.slice(1);
    return PAGES.find((page) => page.key === path)?.key || '';
  }, [pathname]);

  useInitGlobalState();

  return (
    <nav className="flex w-full items-center rounded-xl bg-white/90 px-8 shadow-xl backdrop-blur">
      {PAGES.map((page) => {
        const isHomePage = activeKey === page.key || (!activeKey && page.key === 'entry');
        return (
          <Link
            key={page.key.toUpperCase()}
            className={clsx(
              'flex flex-grow items-center justify-center rounded-t-lg py-4',
              isHomePage ? 'text-blue' : 'text-[#9FC2D7]',
            )}
            href={`/${page.key.toLowerCase()}`}
          >
            {createElement(page?.icon, { className: 'text-2xl' })}
          </Link>
        );
      })}
    </nav>
  );
}

export default Navbar;
