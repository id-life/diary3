'use client';

import { ProviderComposer } from '@/components/common/ProviderComposer';
import { persistor, store } from '@/entry/store';
import { JotaiStoreProvider } from '@/providers/jotai-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } });

const contexts = [
  <ReduxProvider key="reduxProvider" store={store} children={undefined} />,
  <JotaiStoreProvider key="jotaiStoreProvider" />,
  <QueryClientProvider key="queryClientProvider" client={queryClient} />,
  <PersistGate key="persistGate" loading={null} persistor={persistor} />,
];

export default function Providers({ children }: PropsWithChildren) {
  return <ProviderComposer contexts={contexts}>{children}</ProviderComposer>;
}
