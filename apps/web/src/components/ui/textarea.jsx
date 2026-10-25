import * as React from 'react';
import { cn } from '@/lib/utils';

/** Textarea no padrão do input: hairline, painel escuro, foco âmbar. */
const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-28 w-full rounded-md border border-bone/20 bg-panel px-4 py-3 text-base font-medium text-bone transition placeholder:text-bone/40 focus-visible:border-flame/70 focus-visible:shadow-hard-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger motion-reduce:transition-none',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Textarea };
