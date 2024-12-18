'use client';

import React, { PropsWithChildren, JSX } from 'react';
import { JotaiStoreProvider } from '@/providers/jotai-provider';
import { ProviderComposer } from '@/components/common/ProviderComposer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
import { persistor, store } from '@/entry/store';

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } });

const contexts: JSX.Element[] = [
  <ReduxProvider key="reduxProvider" store={store} children={undefined} />,
  <JotaiStoreProvider key="jotaiStoreProvider" />,
  <QueryClientProvider key="queryClientProvider" client={queryClient} />,
  <PersistGate key="persistGate" loading={null} persistor={persistor} />,
];

export default function Providers({ children }: PropsWithChildren) {
  return <ProviderComposer contexts={contexts}>{children}</ProviderComposer>;
}
