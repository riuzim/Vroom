import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-none border-2 px-3 py-1 text-xs font-black uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-raised text-bone',
        success: 'border-transparent bg-acid text-ink',
        destructive: 'border-transparent bg-danger text-ink',
        outline: 'border-bone text-bone',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
