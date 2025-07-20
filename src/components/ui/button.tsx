import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';
import { twMerge } from 'tailwind-merge';

import { cn } from '@/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // Custom button variants for backward compatibility
        primary: 'border-diary-primary bg-diary-primary text-white enabled:hover:opacity-80 rounded-lg border font-semibold',
        danger: 'border-diary-danger bg-diary-danger text-white enabled:hover:opacity-80 rounded-2xl border font-semibold',
        unstyle: '',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        // Custom button sizes for backward compatibility
        large: 'py-2 px-5',
        middle: 'py-1 px-4',
        small: 'px-1',
      },
      ghost: {
        true: '',
        false: '',
      },
      danger: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      ghost: false,
      danger: false,
    },
    compoundVariants: [
      // Ghost variants
      {
        ghost: true,
        variant: 'default',
        class:
          'border-white text-white enabled:hover:border-diary-primary enabled:hover:text-diary-primary bg-transparent rounded-2xl border font-semibold',
      },
      {
        ghost: true,
        variant: 'primary',
        class:
          'border-diary-primary bg-transparent text-diary-primary enabled:hover:opacity-80 rounded-2xl border font-semibold',
      },
      {
        ghost: true,
        variant: 'link',
        class: 'border-transparent text-white enabled:hover:text-diary-primary rounded-2xl border font-semibold',
      },
      // Danger variants
      {
        danger: true,
        variant: 'default',
        class: 'border-diary-danger text-diary-danger enabled:hover:opacity-80 bg-white rounded-2xl border font-semibold',
      },
      {
        danger: true,
        variant: 'primary',
        class: 'border-diary-danger bg-diary-danger text-white enabled:hover:opacity-80 rounded-2xl border font-semibold',
      },
      {
        danger: true,
        variant: 'link',
        class: 'border-transparent text-diary-danger enabled:hover:opacity-80 rounded-2xl border font-semibold',
      },
      // Default custom button styles
      {
        variant: 'default',
        ghost: false,
        danger: false,
        class:
          'border-black/40 bg-white text-black enabled:hover:border-diary-primary enabled:hover:text-diary-primary rounded-2xl border font-semibold',
      },
      {
        variant: 'link',
        ghost: false,
        danger: false,
        class: 'border-transparent enabled:hover:text-diary-primary rounded-2xl border font-semibold',
      },
    ],
  },
);

// Loading icon component extracted outside render function
const LoadingIcon: React.FC<{
  loadingIconProps?: {
    renderIcon?: () => React.ReactNode;
    iconClassName?: string;
    iconStyle?: React.CSSProperties;
  };
  iconClassName?: string;
}> = ({ loadingIconProps, iconClassName }) => {
  if (loadingIconProps?.renderIcon) return loadingIconProps.renderIcon();
  return (
    <AiOutlineLoading
      className={twMerge('h-4 w-4 animate-spin', loadingIconProps?.iconClassName || iconClassName)}
      style={loadingIconProps?.iconStyle}
    />
  );
};

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  // Custom button props for backward compatibility
  type?: 'default' | 'primary' | 'link' | 'unstyle';
  loading?: boolean;
  iconClassName?: string;
  loadingIconProps?: {
    renderIcon?: () => React.ReactNode;
    iconClassName?: string;
    iconStyle?: React.CSSProperties;
  };
  htmlType?: 'button' | 'submit' | 'reset';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      type,
      loading = false,
      disabled,
      ghost = false,
      danger = false,
      iconClassName,
      loadingIconProps,
      htmlType,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    // Map legacy type prop to variant for backward compatibility
    const mappedVariant = type || variant;
    const _disabled = disabled || loading;

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant: mappedVariant,
            size,
            ghost,
            danger,
            className: mappedVariant === 'unstyle' ? className : undefined,
          }),
          mappedVariant !== 'unstyle' ? className : undefined,
          _disabled ? 'disabled:cursor-not-allowed disabled:opacity-60' : 'cursor-pointer',
        )}
        ref={ref}
        disabled={_disabled}
        onClick={_disabled ? undefined : onClick}
        type={htmlType}
        {...props}
      >
        {loading && (
          <div className="mr-2 inline-block">
            <LoadingIcon loadingIconProps={loadingIconProps} iconClassName={iconClassName} />
          </div>
        )}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
