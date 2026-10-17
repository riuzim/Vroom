import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex min-h-11 w-full rounded-md border border-input bg-panelSoft px-4 py-2 text-base font-semibold text-white transition placeholder:text-white/35 focus-visible:border-flame focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-flame/10 disabled:cursor-not-allowed disabled:opacity-60',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
