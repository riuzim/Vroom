import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm border border-bone/20 bg-transparent px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-bone transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-bone/15 bg-raised text-bone',
        success: 'border-transparent bg-acid text-ink',
        destructive: 'border-transparent bg-danger text-bone',
        outline: 'border-bone/30 text-bone',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
