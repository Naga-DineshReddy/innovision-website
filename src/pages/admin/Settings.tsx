import { RefreshCw, Database, Shield, Cloud } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

export default function Settings() {
  const { adminProfile, signOut } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage application settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Admin Profile */}
        {adminProfile && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-4">Admin Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Name</span>
                <span className="text-[var(--text-primary)] font-medium">{adminProfile.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Email</span>
                <span className="text-[var(--text-primary)] font-medium">{adminProfile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Role</span>
                <span className="text-[var(--text-primary)] font-medium capitalize">{adminProfile.role}</span>
              </div>
            </div>
          </div>
        )}

        {/* App Info */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-4">Application Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Application</span>
              <span className="text-[var(--text-primary)] font-medium">InnoVision Admin Panel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Version</span>
              <span className="text-[var(--text-primary)] font-medium">2.0.0 (Phase 2 — Supabase)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Data Storage</span>
              <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                <Cloud className="w-4 h-4 text-primary" /> Supabase Cloud
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Authentication</span>
              <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                <Shield className="w-4 h-4 text-green-400" /> Supabase Auth
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Database</span>
              <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                <Database className="w-4 h-4 text-blue-400" /> PostgreSQL + RLS
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-2">Actions</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Manage your session and application state.
          </p>
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              icon={<RefreshCw className="w-4 h-4" />}
              fullWidth
            >
              Refresh Application
            </Button>
            <Button
              variant="danger"
              onClick={signOut}
              fullWidth
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Phase 2 Features */}
        <div className="glass-card p-6 border-primary/20">
          <h2 className="text-lg font-bold font-heading text-primary mb-2">✅ Phase 2 — Completed</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>• Supabase backend integration</li>
            <li>• Real authentication with email/password</li>
            <li>• PostgreSQL database with Row-Level Security</li>
            <li>• Contact form → messages management</li>
            <li>• Real-time data sync via Supabase</li>
            <li>• CSV export for registrations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
