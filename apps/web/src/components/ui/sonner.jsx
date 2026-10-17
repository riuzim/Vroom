import { Toaster as Sonner } from 'sonner';

const Toaster = (props) => (
  <Sonner
    className="toaster group"
    toastOptions={{
      style: { borderRadius: '0px' },
      classNames: {
        toast:
          'group toast group-[.toaster]:rounded-none group-[.toaster]:border-2 group-[.toaster]:border-bone group-[.toaster]:bg-panel group-[.toaster]:text-bone group-[.toaster]:shadow-hard',
        description: 'group-[.toast]:text-bone/60',
        actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton: 'group-[.toast]:bg-bone/10 group-[.toast]:text-bone/70',
      },
    }}
    {...props}
  />
);

export { Toaster };
