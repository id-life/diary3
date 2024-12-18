'use client';

import GithubLoadDialog from '@/components/app/GithubLoadDialog';
import UserHeader from '@/components/layout/header/HeaderUser';
import Navbar from '@/components/layout/Navbar';
import { initDayEntryInstances } from '@/entry/entry-instances-slice';
import { selectLoginUser, useAppDispatch, useAppSelector } from '@/entry/store';
import { getDateStringFromNow } from '@/entry/types-constants';
import { initDateStr } from '@/entry/ui-slice';
import { useInitGlobalState } from '@/hooks/app';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { ToastContainer } from 'react-toastify';

export default function AppPage() {
  // const location = useLocation();
  // const loginUser = useAppSelector(selectLoginUser);
  const dispatch = useAppDispatch();
  const appDivRef = useRef<HTMLDivElement>(null);
  useInitGlobalState();
  useEffect(() => {
    const dateStrNow = getDateStringFromNow();
    dispatch(initDateStr({ dateStr: dateStrNow }));
    dispatch(initDayEntryInstances({ dateStr: dateStrNow }));

    const setAppDivHeight = () => {
      if (appDivRef.current) {
        appDivRef.current.style.height = `${window.innerHeight}px`;
      }
    };

    setAppDivHeight();
    window.addEventListener('resize', setAppDivHeight);

    return () => {
      window.removeEventListener('resize', setAppDivHeight);
    };
  }, [dispatch]);

  return (
    <>
      <div ref={appDivRef} className={clsx('flex flex-col overflow-hidden')}>
        <ToastContainer autoClose={3000} position="top-center" />
        {/* {location.pathname !== '/setltings' && <UserHeader loginUser={loginUser} />} */}
        {/* <GithubLoadDialog /> */}
        {/* <Navbar /> */}
      </div>
    </>
  );
}
