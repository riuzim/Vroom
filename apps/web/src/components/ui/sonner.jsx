import { Toaster as Sonner } from 'sonner';

const Toaster = (props) => (
  <Sonner
    className="toaster group"
    toastOptions={{
      classNames: {
        toast: 'group toast group-[.toaster]:bg-panel group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl',
        description: 'group-[.toast]:text-white/60',
        actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton: 'group-[.toast]:bg-white/10 group-[.toast]:text-white/70',
      },
    }}
    {...props}
  />
);

export { Toaster };
