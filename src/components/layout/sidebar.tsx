'use client';

import { selectLoginUser, useAppSelector } from '@/entry/store';
import { useUser } from '@clerk/nextjs';
import { Calendar, ChevronDown, Clock, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chevronVariants, menuContainerVariants, menuItemVariants, sidebarNavVariants } from '@/constants/anim';

export function Sidebar() {
  const loginUser = useAppSelector(selectLoginUser);
  const { user } = useUser();
  const username = useMemo(() => loginUser?.uid || user?.username, [loginUser, user]);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex min-w-64 flex-col">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-md p-4 transition hover:bg-gray-50"
      >
        {username ? (
          <div className="text-lg/5">
            <span className="mr-0.5 font-medium">{username}</span>‘s Diary
          </div>
        ) : null}
        <motion.div variants={chevronVariants} animate={isExpanded ? 'expanded' : 'collapsed'}>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence mode="sync">
        {isExpanded && (
          <motion.nav className="flex-1 overflow-hidden" {...sidebarNavVariants}>
            <motion.div
              className="flex flex-col gap-2 p-2 "
              variants={menuContainerVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <motion.div variants={menuItemVariants}>
                <Link
                  href="/entry"
                  className="flex items-center gap-2 rounded-md bg-[#1e1b39] p-3 text-white transition-colors hover:bg-[#2a2751]"
                >
                  <Calendar className="h-5 w-5" />
                  <span>My Diary</span>
                </Link>
              </motion.div>

              <motion.div variants={menuItemVariants}>
                <Link
                  href="/add"
                  className="flex items-center justify-between rounded-md p-3 transition-colors hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5" />
                    <span>Entry Type</span>
                  </div>
                  <span className="text-sm text-gray-500">8</span>
                </Link>
              </motion.div>

              <motion.div variants={menuItemVariants}>
                <Link href="/reminder" className="flex items-center gap-2 rounded-md p-3 transition-colors hover:bg-gray-100">
                  <Clock className="h-5 w-5" />
                  <span>Reminder</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
