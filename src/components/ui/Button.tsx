import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading,
  fullWidth,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-3 font-semibold rounded-xl transition-all duration-300 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap';

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] active:scale-[0.98] focus-visible:outline-primary border border-transparent',
    secondary: 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] hover:shadow-[var(--shadow-glow)] active:scale-[0.98] backdrop-blur-xl focus-visible:outline-primary',
    ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] active:scale-[0.98] focus-visible:outline-primary border border-transparent',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] active:scale-[0.98] focus-visible:outline-red-500 border border-transparent',
  };

  const sizes = {
    sm: 'h-10 min-h-[40px] px-5 text-sm',
    md: 'h-12 min-h-[48px] px-7 text-base',
    lg: 'h-14 min-h-[56px] px-9 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="w-5 h-5 shrink-0 inline-flex items-center justify-center">{icon}</span>
      ) : null}
      <span className="inline-block">{children}</span>
    </motion.button>
  );
}
