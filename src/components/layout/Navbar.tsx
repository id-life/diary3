'use client';

import { addDialogOpenAtom } from '@/atoms';
import { useInitGlobalState } from '@/hooks/app';
import { useGitHubOAuth } from '@/hooks/useGitHubOAuth';
import { cn } from '@/utils';
import clsx from 'clsx';
import { useSetAtom } from 'jotai';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createElement, FC, SVGProps, useMemo } from 'react';
import { AddCircleSVG, EntrySVG, HomeSVG, ReminderSVG, UserSVG } from '../svg';
import { useJotaiSelectors } from '@/hooks/useJotaiMigration';

export const PAGES: { key: string; icon: FC<SVGProps<SVGElement>>; className?: string }[] = [
  { key: 'entry', icon: HomeSVG },
  { key: 'add', icon: EntrySVG },
  { key: 'add-entry', icon: AddCircleSVG, className: 'size-9' }, // TODO: add entry dialog
  { key: 'reminder', icon: ReminderSVG },
  { key: 'settings', icon: UserSVG },
];

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { reminderRecords } = useJotaiSelectors();
  const { isAuthenticated, isLoading, user } = useGitHubOAuth();
  const setAddDialogOpen = useSetAtom(addDialogOpenAtom);
  const activeKey = useMemo(() => {
    if (!pathname) return '';
    const topLevelPath = pathname.split('/')[1];
    if (topLevelPath === 'reminder') return 'reminder';
    return PAGES.find((page) => page.key === topLevelPath)?.key || '';
  }, [pathname]);

  console.log('Navbar rendered. IsAuthenticated:', isAuthenticated, 'User:', user?.username);

  useInitGlobalState();

  if (!isAuthenticated || isLoading) {
    return null;
  }

  const handleReminderClick = () => {
    if (reminderRecords && reminderRecords.length > 0) {
      router.push('/reminder');
    } else {
      router.push('/reminder/add');
    }
  };

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
                  'text-[#BBBAC3] hover:text-primary',
                )}
                onClick={() => setAddDialogOpen(true)}
              >
                {createElement(icon, {
                  className: cn(
                    'text-2xl/6 size-6 transition-all hover:brightness-90 duration-300 hover:fill-primary',
                    className,
                  ),
                })}
              </button>
            );
          }

          if (key === 'reminder') {
            return (
              <button
                key={key.toUpperCase()}
                className={clsx(
                  'flex flex-grow items-center justify-center rounded-t-lg py-2',
                  isActive ? 'text-primary' : 'text-[#BBBAC3]',
                )}
                onClick={handleReminderClick}
              >
                {createElement(icon, {
                  className: cn(
                    'text-2xl/6 size-6 transition-all hover:brightness-90 duration-300',
                    isActive && 'fill-primary hover:fill-primary',
                    className,
                  ),
                })}
              </button>
            );
          }

          return (
            <Link
              key={key.toUpperCase()}
              className={clsx(
                'flex flex-grow items-center justify-center rounded-t-lg py-2',
                isActive || isInHomePage ? 'text-primary' : 'text-[#BBBAC3]',
              )}
              href={`/${key.toLowerCase()}`}
            >
              {createElement(icon, {
                className: cn(
                  'text-2xl/6 size-6 transition-all hover:brightness-90 duration-300',
                  (isActive || isInHomePage) && 'fill-primary hover:fill-primary',
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
