import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-black uppercase tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-2 border-bone bg-primary text-primary-foreground shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
        destructive:
          'border-2 border-bone bg-danger text-ink shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
        outline: 'border-2 border-bone bg-transparent text-bone hover:bg-bone hover:text-ink',
        secondary: 'border-2 border-bone bg-raised text-bone hover:bg-line',
        ghost:
          'border-2 border-transparent text-bone/80 hover:border-line hover:bg-raised hover:text-bone',
        link: 'border-2 border-transparent text-flame underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-11 px-6 py-2',
        sm: 'min-h-9 px-3 text-xs',
        lg: 'min-h-12 px-8 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
