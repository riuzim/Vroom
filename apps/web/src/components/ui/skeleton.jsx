import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }) {
  return <div className={cn('dither-skeleton', className)} {...props} />;
}

export { Skeleton };
