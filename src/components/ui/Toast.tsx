import { Toaster } from 'sonner';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-card)',
        },
      }}
      richColors
      closeButton
    />
  );
}
