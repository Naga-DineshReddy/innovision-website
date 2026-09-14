import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AdminStats, AdminProfile } from '../types';
import { mockEvents, mockTeamMembers, mockBanners } from '../data/mockData';

export async function getDashboardStats(): Promise<AdminStats> {
  const fallbackStats: AdminStats = {
    totalEvents: mockEvents.length,
    upcomingEvents: mockEvents.filter(e => e.status === 'upcoming').length,
    totalRegistrations: 12,
    totalGalleryPhotos: 6,
    activeBanners: mockBanners.filter(b => b.isActive).length,
    totalTeamMembers: mockTeamMembers.length,
  };

  if (!isSupabaseConfigured) {
    return fallbackStats;
  }

  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error || !data) {
      return fallbackStats;
    }

    const stats = data as Record<string, number>;
    return {
      totalEvents: stats.total_events ?? fallbackStats.totalEvents,
      upcomingEvents: stats.upcoming_events ?? fallbackStats.upcomingEvents,
      totalRegistrations: stats.total_registrations ?? fallbackStats.totalRegistrations,
      totalGalleryPhotos: stats.total_gallery_photos ?? fallbackStats.totalGalleryPhotos,
      activeBanners: stats.active_banners ?? fallbackStats.activeBanners,
      totalTeamMembers: stats.total_team_members ?? fallbackStats.totalTeamMembers,
    };
  } catch {
    return fallbackStats;
  }
}

export async function getAdminProfile(userId: string): Promise<AdminProfile | null> {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;

  return {
    id: data.id,
    userId: data.user_id,
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    isActive: data.is_active,
    createdAt: data.created_at,
  };
}
