import { Link } from 'react-router-dom';
import { Globe, Link2, Share2, MessageCircle, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import mascotDark from '../assets/innovision-mascot-dark.png';
import mascotLight from '../assets/innovision-mascot-light.png';

const footerLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Our Team', path: '/team' },
  { name: 'Events', path: '/events' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
];

const socialLinks = [
  { icon: Globe, href: '#', label: 'Instagram' },
  { icon: Link2, href: '#', label: 'LinkedIn' },
  { icon: Share2, href: '#', label: 'GitHub' },
  { icon: MessageCircle, href: '#', label: 'Twitter' },
];

export default function Footer() {
  const { isDark } = useTheme();
  const settings = useSiteSettings();

  return (
    <footer className="relative border-t border-[var(--glass-border)] bg-[var(--bg-secondary)]">
      {/* Decorative glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent pointer-events-none" />

      <div className="section-container py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-start">
          {/* Column 1: Brand (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img
                  key={isDark ? 'dark-mascot-footer' : 'light-mascot-footer'}
                  src={isDark ? mascotDark : mascotLight}
                  alt="INNOVISION Mascot Logo"
                  className={`w-full h-full object-contain select-none transition-all duration-300 ${
                    isDark
                      ? 'drop-shadow-[0_0_15px_rgba(0,212,255,0.45)]'
                      : 'drop-shadow-[0_4px_12px_rgba(14,165,233,0.25)]'
                  }`}
                />
              </div>
              <span className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-primary)] group-hover:text-primary transition-colors tracking-tight">
                INNOVISION
              </span>
            </Link>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-md">
              Imagine. Innovate. Inspire. — Where Intelligence Meets Innovation. Empowering students to explore AI, Data Science, and cutting-edge technologies.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-primary hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all duration-300 active:scale-95"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 sm:mb-5 font-heading">
              Quick Links
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm sm:text-base text-[var(--text-secondary)] hover:text-primary transition-all inline-flex items-center gap-1.5 group py-0.5"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact (4 cols) */}
          <div className="lg:col-span-4 md:col-span-2 lg:col-auto">
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 sm:mb-5 font-heading">
              Contact Us
            </h3>
            <ul className="space-y-3.5 sm:space-y-4">
              <li className="flex items-start gap-3 text-sm sm:text-base text-[var(--text-secondary)]">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Email</p>
                  <a href={`mailto:${settings.contactEmail}`} className="text-[var(--text-primary)] hover:text-primary transition-colors font-medium truncate block">
                    {settings.contactEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm sm:text-base text-[var(--text-secondary)]">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Location</p>
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                    {settings.contactAddress}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-[var(--glass-border)] text-center">
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-normal">
            © 2026 InnoVision. All Rights Reserved. Built with 💡 by the InnoVision Technical Team.
          </p>
        </div>
      </div>
    </footer>
  );
}

