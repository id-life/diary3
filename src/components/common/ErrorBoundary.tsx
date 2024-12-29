'use client';

import type { FC, PropsWithChildren } from 'react';
import { ErrorBoundary as ErrorBoundaryLib } from 'react-error-boundary';
import { Button } from '../ui/button';

const FallbackComponent = () => {
  return (
    <div className="flex-center-y h-full w-full gap-2 py-6">
      Oops, Something wrong!
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        Reload Page
      </Button>
    </div>
  );
};
export const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ErrorBoundaryLib
      FallbackComponent={FallbackComponent}
      onError={(e) => {
        console.error(e);
      }}
    >
      {children}
    </ErrorBoundaryLib>
  );
};
