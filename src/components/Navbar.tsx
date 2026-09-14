import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

import { useTheme } from '../contexts/ThemeContext';
import mascotDark from '../assets/innovision-mascot-dark.png';
import mascotLight from '../assets/innovision-mascot-light.png';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Our Team', path: '/team' },
  { name: 'Events', path: '/events' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img
                key={isDark ? 'dark-mascot' : 'light-mascot'}
                src={isDark ? mascotDark : mascotLight}
                alt="INNOVISION Mascot Logo"
                className={`w-full h-full object-contain select-none transition-all duration-300 ${
                  isDark
                    ? 'drop-shadow-[0_0_15px_rgba(0,212,255,0.45)]'
                    : 'drop-shadow-[0_4px_12px_rgba(14,165,233,0.25)]'
                }`}
              />
            </div>
            <span className="text-xl md:text-2xl font-bold font-heading text-[var(--text-primary)] group-hover:text-primary transition-colors tracking-tight">
              INNOVISION
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-3.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center justify-center px-5 xl:px-6 py-2.5 xl:py-3 text-[15px] xl:text-base font-semibold rounded-xl transition-all duration-300 whitespace-nowrap active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/30 via-primary/20 to-secondary/30 text-white border border-primary/80 shadow-[0_0_20px_rgba(0,212,255,0.35)]'
                      : 'bg-[var(--bg-card)]/80 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-cyan-400/60 hover:bg-[var(--bg-card)] hover:shadow-[0_0_18px_rgba(0,212,255,0.2)] backdrop-blur-md'
                  }`}
                >
                  <span className="px-0.5">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3.5">
            <ThemeToggle />
            <Link
              to="/admin"
              className="inline-flex items-center justify-center gap-2.5 h-12 xl:h-13 px-7 xl:px-8 text-base xl:text-[17px] font-bold tracking-wide rounded-xl bg-gradient-to-r from-primary via-cyan-500 to-secondary text-white border border-cyan-300/40 shadow-[0_0_25px_rgba(0,212,255,0.35)] hover:shadow-[0_0_35px_rgba(0,212,255,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
            >
              <Shield className="w-5 h-5 text-cyan-200" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex lg:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden border-t border-[var(--glass-border)] glass-nav shadow-2xl"
          >
            <div className="section-container py-4 space-y-1.5 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
              {navLinks.map((link, i) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center min-h-[48px] px-5 py-3 rounded-xl text-base font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-primary/20 via-primary/15 to-secondary/20 text-primary border border-primary/40 shadow-sm'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.03 }}
                className="pt-2 border-t border-[var(--glass-border)]"
              >
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2.5 min-h-[52px] px-6 py-3.5 rounded-xl text-base sm:text-lg font-bold tracking-wide bg-gradient-to-r from-primary via-cyan-500 to-secondary text-white border border-cyan-300/40 shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
                >
                  <Shield className="w-5 h-5 text-cyan-200" />
                  <span>Admin Panel</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
