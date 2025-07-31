'use client';

import { addDialogOpenAtom } from '@/atoms';
import { useInitGlobalState } from '@/hooks/app';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { cn } from '@/utils';
import clsx from 'clsx';
import { useSetAtom } from 'jotai';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createElement, FC, SVGProps, useEffect, useMemo } from 'react';
import { AddCircleSVG, EntrySVG, HomeSVG, ReminderSVG, UserSVG } from '../svg';

export const PAGES: { key: string; icon: FC<SVGProps<SVGElement>>; className?: string }[] = [
  { key: 'entry', icon: HomeSVG },
  { key: 'add', icon: EntrySVG },
  { key: 'add-entry', icon: AddCircleSVG, className: 'size-9' }, // TODO: add entry dialog
  { key: 'reminder', icon: ReminderSVG },
  { key: 'settings', icon: UserSVG },
];

function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useGitHubOAuth();
  const setAddDialogOpen = useSetAtom(addDialogOpenAtom);
  const activeKey = useMemo(() => {
    if (!pathname) return '';
    const topLevelPath = pathname.split('/')[1];
    return PAGES.find((page) => page.key === topLevelPath)?.key || '';
  }, [pathname]);

  useInitGlobalState();
  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <>
      <nav className="flex w-full items-center rounded-xl bg-white px-6 drop-shadow-[0px_-4px_8px_rgba(0,0,0,0.05)]">
        {PAGES.map((page) => {
          const { className, key, icon } = page;
          const isActive = activeKey === key;
          const isInHomePage = !activeKey && key === 'entry';

          if (key === 'add-entry') {
            return (
              <button
                key={key.toUpperCase()}
                className={clsx(
                  'flex flex-grow items-center justify-center rounded-t-lg py-2',
                  'text-[#BBBAC3] hover:text-blue',
                )}
                onClick={() => setAddDialogOpen(true)}
              >
                {createElement(icon, {
                  className: cn('text-2xl/6 size-6 transition-all hover:brightness-90 duration-300 hover:fill-blue', className),
                })}
              </button>
            );
          }

          return (
            <Link
              key={key.toUpperCase()}
              className={clsx(
                'flex flex-grow items-center justify-center rounded-t-lg py-2',
                isActive || isInHomePage ? 'text-blue' : 'text-[#BBBAC3]',
              )}
              href={`/${key.toLowerCase()}`}
            >
              {createElement(icon, {
                className: cn(
                  'text-2xl/6 size-6 transition-all hover:brightness-90 duration-300',
                  (isActive || isInHomePage) && 'fill-blue hover:fill-blue',
                  className,
                ),
              })}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default Navbar;
