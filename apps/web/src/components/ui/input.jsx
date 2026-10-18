import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex min-h-11 w-full rounded-none border-2 border-bone bg-panel px-4 py-2 text-base font-semibold text-bone transition-[border-color,box-shadow] placeholder:text-bone/60 aria-invalid:border-danger aria-invalid:focus-visible:border-danger motion-reduce:transition-none focus-visible:border-flame focus-visible:outline-none focus-visible:shadow-hard-sm disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
