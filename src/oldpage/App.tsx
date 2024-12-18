import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Outlet, useLocation } from 'react-router-dom';
import { initDayEntryInstances } from '../entry/entry-instances-slice';
import { selectLoginUser, useAppDispatch, useAppSelector } from '../entry/store';
import { getDateStringFromNow } from '../entry/types-constants';
import { initDateStr } from '../entry/ui-slice';
import Navbar from '../components/layout/Navbar';
import { ToastContainer } from 'react-toastify';
import GithubLoadDialog from '@/components/app/GithubLoadDialog';
import { useInitGlobalState } from '@/hooks/app';
import { Header } from 'antd/es/layout/layout';

function App() {
  const location = useLocation();
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
      <Helmet>
        <title>Diary - {location.pathname}</title>
      </Helmet>
      <div ref={appDivRef} className={clsx('flex flex-col overflow-hidden')}>
        <ToastContainer autoClose={3000} position="top-center" />
        {location.pathname !== '/settings' && <Header />}
        <main className="min relative flex-grow overflow-auto scroll-smooth bg-[#F6F6F6]">
          <Outlet />
        </main>
        <GithubLoadDialog />
        <Navbar />
      </div>
    </>
  );
}

export default App;
