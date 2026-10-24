import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-raised disabled:text-bone/50 disabled:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Press tátil: sombra stamped 3px colapsa no active (botão "afunda")
        default:
          'border border-transparent bg-primary text-primary-foreground shadow-hard hover:-translate-y-px hover:shadow-hard-lg active:translate-y-[2px] active:shadow-none',
        destructive:
          'border border-danger/60 bg-transparent text-danger hover:border-danger hover:bg-danger/10 active:translate-y-px',
        outline:
          'border border-bone/25 bg-panel/60 text-bone hover:border-flame hover:text-flame active:translate-y-px',
        secondary:
          'border border-bone/15 bg-raised text-bone hover:border-flame/60 hover:shadow-hard-sm active:translate-y-[2px] active:shadow-none',
        ghost:
          'border border-transparent text-bone/80 hover:bg-raised hover:text-bone active:translate-y-px',
        link: 'border border-transparent text-flame underline-offset-4 hover:underline',
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
