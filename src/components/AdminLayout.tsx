import { useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AdminSidebar from './AdminSidebar';
import mascotDark from '../assets/innovision-mascot-dark.png';
import mascotLight from '../assets/innovision-mascot-light.png';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--glass-border)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src={isDark ? mascotDark : mascotLight}
                alt="INNOVISION Mascot Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-heading font-bold text-sm text-[var(--text-primary)]">
              Admin Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        </div>
      </header>

      {/* Admin Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        } ml-0`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

