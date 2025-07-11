/* eslint-disable react/no-children-prop */
'use client';

import { ProviderComposer } from '@/components/common/ProviderComposer';
import { JotaiStoreProvider } from '@/providers/jotai-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } });
const contexts = [
  <JotaiStoreProvider key="jotaiStoreProvider" />,
  <QueryClientProvider key="queryClientProvider" client={queryClient} />,
];

export default function Providers({ children }: PropsWithChildren) {
  return <ProviderComposer contexts={contexts}>{children}</ProviderComposer>;
}
