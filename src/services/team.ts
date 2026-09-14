import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { TeamMember } from '../types';
import { mockTeamMembers } from '../data/mockData';

// --------------- Helpers ---------------

function mapRow(row: Record<string, unknown>): TeamMember {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    category: row.category as TeamMember['category'],
    profileImageUrl: row.profile_image_url as string,
    department: row.department as string,
    year: row.year as string,
    email: row.email as string,
    phone: row.phone as string,
    linkedinUrl: row.linkedin_url as string,
    instagramUrl: row.instagram_url as string,
    displayOrder: row.display_order as number,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,

    // Compat aliases
    image: row.profile_image_url as string,
    linkedin: row.linkedin_url as string,
    instagram: row.instagram_url as string,
  };
}

// --------------- Public API ---------------

export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured) {
    return mockTeamMembers.filter(m => m.isActive !== false).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.warn('Supabase getActiveTeamMembers failed, using mock data:', error.message);
      return mockTeamMembers.filter(m => m.isActive !== false);
    }
    return (data ?? []).map(mapRow);
  } catch (err) {
    console.warn('getActiveTeamMembers network error, using mock data:', err);
    return mockTeamMembers;
  }
}

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured) {
    return mockTeamMembers;
  }

  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order');

    if (error) {
      console.warn('Supabase getAllTeamMembers failed, using mock data:', error.message);
      return mockTeamMembers;
    }
    return (data ?? []).map(mapRow);
  } catch {
    return mockTeamMembers;
  }
}

export async function createTeamMember(memberData: Partial<TeamMember>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      name: memberData.name ?? '',
      role: memberData.role ?? '',
      category: memberData.category ?? 'Technical Team',
      profile_image_url: memberData.profileImageUrl ?? memberData.image ?? '',
      department: memberData.department ?? '',
      year: memberData.year ?? '',
      email: memberData.email ?? '',
      phone: memberData.phone ?? '',
      linkedin_url: memberData.linkedinUrl ?? memberData.linkedin ?? '',
      instagram_url: memberData.instagramUrl ?? memberData.instagram ?? '',
      display_order: memberData.displayOrder ?? 0,
      is_active: memberData.isActive ?? true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function updateTeamMember(id: string, memberData: Partial<TeamMember>): Promise<TeamMember> {
  const payload: Record<string, unknown> = {};

  if (memberData.name !== undefined) payload.name = memberData.name;
  if (memberData.role !== undefined) payload.role = memberData.role;
  if (memberData.category !== undefined) payload.category = memberData.category;
  if (memberData.profileImageUrl !== undefined || memberData.image !== undefined) {
    payload.profile_image_url = memberData.profileImageUrl ?? memberData.image;
  }
  if (memberData.department !== undefined) payload.department = memberData.department;
  if (memberData.year !== undefined) payload.year = memberData.year;
  if (memberData.email !== undefined) payload.email = memberData.email;
  if (memberData.phone !== undefined) payload.phone = memberData.phone;
  if (memberData.linkedinUrl !== undefined || memberData.linkedin !== undefined) {
    payload.linkedin_url = memberData.linkedinUrl ?? memberData.linkedin;
  }
  if (memberData.instagramUrl !== undefined || memberData.instagram !== undefined) {
    payload.instagram_url = memberData.instagramUrl ?? memberData.instagram;
  }
  if (memberData.displayOrder !== undefined) payload.display_order = memberData.displayOrder;
  if (memberData.isActive !== undefined) payload.is_active = memberData.isActive;

  const { data, error } = await supabase
    .from('team_members')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function deleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
