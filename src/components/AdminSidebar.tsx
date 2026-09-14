import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Image, Megaphone, Settings,
  ClipboardList, ChevronLeft, ChevronRight, LogOut, MessageSquare, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import mascotDark from '../assets/innovision-mascot-dark.png';
import mascotLight from '../assets/innovision-mascot-light.png';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Events', path: '/admin/events', icon: Calendar },
  { name: 'Registrations', path: '/admin/registrations', icon: ClipboardList },
  { name: 'Banners', path: '/admin/banners', icon: Megaphone },
  { name: 'Gallery', path: '/admin/gallery', icon: Image },
  { name: 'Team', path: '/admin/team', icon: Users },
  { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: AdminSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isDark } = useTheme();

  const handleLogout = async () => {
    await signOut();
  };

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 bg-[var(--bg-secondary)] border-r border-[var(--glass-border)] flex flex-col ${
          // Desktop sizing
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          // Mobile visibility
          mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 w-64'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)] min-h-[4rem]">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden" onClick={handleLinkClick}>
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <img
                src={isDark ? mascotDark : mascotLight}
                alt="INNOVISION Mascot Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className={`flex flex-col transition-opacity duration-200 ${collapsed ? 'lg:hidden' : 'block'}`}>
              <span className="text-base font-bold font-heading text-[var(--text-primary)] leading-tight">
                INNOVISION
              </span>
              <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] lg:hidden focus:outline-none"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto overflow-x-hidden">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleLinkClick}
                title={collapsed ? link.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/25 shadow-sm shadow-primary/10'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <link.icon className="w-5 h-5 shrink-0" />
                <span className={`truncate ${collapsed ? 'lg:hidden' : 'inline'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--glass-border)] space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : 'inline'}>Logout</span>
          </button>
          
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all duration-200 text-left"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

