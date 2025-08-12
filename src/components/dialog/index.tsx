import { cn } from '@/utils';
import {
  FloatingFocusManager,
  FloatingNode,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { cloneElement, useCallback, useEffect, useState } from 'react';
import { RiCloseFill } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';

type DialogProps = {
  open?: boolean;
  title?: React.ReactNode;
  zIndex?: 0 | 20 | 30 | 40 | 50;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onExitComplete?: () => void;
  showCloseButton?: boolean;
  render: (props: { close: () => void }) => React.ReactNode;
  children?: JSX.Element;
  className?: string;
  scroll?: boolean;
  renderHeader?: (props: { close: () => void }) => React.ReactNode;
  renderFooter?: (props: { close: () => void }) => React.ReactNode;
  maskClass?: string;
};

function Dialog({
  render,
  open: passedOpen = false,
  title,
  children,
  showCloseButton = true,
  onOpenChange,
  onExitComplete,
  onClose: prevOnClose,
  className,
  renderHeader,
  renderFooter,
  scroll = true,
  maskClass,
}: React.PropsWithChildren<DialogProps>) {
  const [open, setOpen] = useState(false);

  const nodeId = useFloatingNodeId();

  const onClose = useCallback(
    (value: boolean) => {
      setOpen(value);
      prevOnClose?.();
      onOpenChange?.(value);
    },
    [onOpenChange, prevOnClose],
  );

  const {
    refs: { setFloating, setReference },
    context,
  } = useFloating({
    open,
    nodeId,
    onOpenChange: onClose,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useRole(context), useDismiss(context)]);

  const _renderHeader = useCallback(() => {
    if (renderHeader) return renderHeader?.({ close: () => onClose(false) });
    if (!title && !showCloseButton) return null;
    return (
      <div className="relative mb-4 h-auto px-5 text-center text-xl font-medium leading-[22px]">
        {title}
        {showCloseButton && (
          <div className="absolute right-5 top-0 flex h-4 w-4 cursor-pointer items-center justify-center">
            <RiCloseFill
              className="stroke-white transition-all duration-300 hover:rotate-180"
              width={14}
              height={14}
              onClick={() => onClose(false)}
            />
          </div>
        )}
      </div>
    );
  }, [onClose, renderHeader, showCloseButton, title]);

  useEffect(() => {
    if (passedOpen === undefined) return;
    setOpen(passedOpen);
  }, [passedOpen]);

  return (
    <FloatingNode id={nodeId}>
      {children && cloneElement(children, getReferenceProps({ ref: setReference, ...children.props }))}
      <FloatingPortal>
        <AnimatePresence onExitComplete={onExitComplete}>
          {open && (
            <FloatingOverlay
              lockScroll
              className={twMerge(clsx('z-50 grid place-items-center bg-black/60 backdrop-blur transition'), maskClass)}
            >
              <FloatingFocusManager context={context}>
                <motion.div
                  className={cn(
                    `relative flex h-fit max-h-[85vh] w-[calc(100%_-_2.5rem)] max-w-2xl flex-col rounded-[10px] bg-white`,
                    renderFooter ? 'pb-20 pt-5' : 'py-5',
                    className,
                  )}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  {...getFloatingProps({ ref: setFloating })}
                >
                  {_renderHeader()}
                  <main
                    className={clsx('flex-grow px-5', {
                      'overflow-auto': scroll,
                    })}
                  >
                    {render({ close: () => onClose(false) })}
                  </main>
                  {renderFooter && (
                    <footer className="absolute bottom-0 left-0 right-0 rounded-b-[10px] px-5 py-5">
                      {renderFooter?.({ close: () => onClose(false) })}
                    </footer>
                  )}
                </motion.div>
              </FloatingFocusManager>
            </FloatingOverlay>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </FloatingNode>
  );
}

export default React.memo(Dialog);
