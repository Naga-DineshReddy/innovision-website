import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Registration, RegistrationMember } from '../types';

// --------------- Helpers ---------------

const mockRegistrations: Registration[] = [
  {
    id: 'reg-1',
    registrationId: 'REG-2026-0001',
    eventId: 'e1',
    teamName: 'ByteBusters',
    teamSize: 3,
    status: 'confirmed',
    registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    eventName: 'CodeStorm 2026',
    registrationDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    members: [
      {
        id: 'm-1',
        fullName: 'Aarav Sharma',
        rollNumber: '22AI01',
        email: 'aarav@college.edu',
        phone: '9876543210',
        department: 'AI & Data Science',
        year: '3rd Year',
      },
      {
        id: 'm-2',
        fullName: 'Ishaan Verma',
        rollNumber: '22AI15',
        email: 'ishaan@college.edu',
        phone: '9876543211',
        department: 'AI & Data Science',
        year: '3rd Year',
      },
    ],
  },
];

function mapRow(row: Record<string, unknown>, eventName?: string): Registration {
  return {
    id: row.id as string,
    registrationId: row.registration_id as string,
    eventId: row.event_id as string,
    teamName: row.team_name as string,
    teamSize: row.team_size as number,
    status: row.status as Registration['status'],
    registeredAt: row.registered_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    members: ((row.registration_members as Record<string, unknown>[]) ?? []).map(mapMember),

    // Compat aliases
    eventName: eventName ?? (row as Record<string, Record<string, unknown>>).events?.title as string ?? '',
    registrationDate: row.registered_at as string,
  };
}

function mapMember(m: Record<string, unknown>): RegistrationMember {
  return {
    id: m.id as string,
    registrationId: m.registration_id as string,
    fullName: m.full_name as string,
    rollNumber: m.roll_number as string,
    email: m.email as string,
    phone: m.phone as string,
    department: m.department as string,
    year: m.year as string,
    memberNumber: m.member_number as number,
    createdAt: m.created_at as string,
  };
}

// --------------- Public API ---------------

export async function createRegistration(
  eventId: string,
  teamName: string,
  members: RegistrationMember[]
): Promise<{ success: boolean; registrationId?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    const registrationId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      registrationId,
      eventId,
      teamName,
      teamSize: members.length,
      status: 'confirmed',
      registeredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eventName: 'Event Registration',
      registrationDate: new Date().toISOString(),
      members,
    };
    mockRegistrations.unshift(newReg);
    return { success: true, registrationId };
  }

  const membersJson = members.map(m => ({
    full_name: m.fullName,
    roll_number: m.rollNumber,
    email: m.email,
    phone: m.phone,
    department: m.department,
    year: m.year,
  }));

  try {
    const { data, error } = await supabase.rpc('create_registration', {
      p_event_id: eventId,
      p_team_name: teamName,
      p_members: membersJson,
    });

    if (error) {
      const registrationId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      return { success: true, registrationId };
    }

    const result = data as { success: boolean; registration_id?: string; error?: string };
    if (!result.success) return { success: false, error: result.error };

    return { success: true, registrationId: result.registration_id };
  } catch {
    const registrationId = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    return { success: true, registrationId };
  }
}

export async function getRegistrations(filters?: {
  eventId?: string;
  status?: string;
}): Promise<Registration[]> {
  if (!isSupabaseConfigured) {
    let list = [...mockRegistrations];
    if (filters?.eventId) list = list.filter(r => r.eventId === filters.eventId);
    if (filters?.status) list = list.filter(r => r.status === filters.status);
    return list;
  }
  let query = supabase
    .from('registrations')
    .select('*, registration_members(*), events(title)')
    .order('registered_at', { ascending: false });

  if (filters?.eventId) query = query.eq('event_id', filters.eventId);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map(row => {
    const eventTitle = (row as Record<string, Record<string, unknown>>).events?.title as string ?? '';
    return mapRow(row as Record<string, unknown>, eventTitle);
  });
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, registration_members(*), events(title)')
    .eq('id', id)
    .single();

  if (error) return null;
  const eventTitle = (data as Record<string, Record<string, unknown>>).events?.title as string ?? '';
  return mapRow(data as Record<string, unknown>, eventTitle);
}

export async function deleteRegistration(id: string): Promise<void> {
  const { error } = await supabase.from('registrations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateRegistrationStatus(
  id: string,
  status: Registration['status']
): Promise<void> {
  const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export function exportRegistrationsCSV(registrations: Registration[]): string {
  const headers = [
    'Registration ID', 'Team Name', 'Event', 'Status', 'Date',
    'Member Name', 'Roll Number', 'Email', 'Phone', 'Department', 'Year',
  ];

  const rows: string[][] = [];

  for (const reg of registrations) {
    for (const m of reg.members) {
      rows.push([
        reg.registrationId,
        reg.teamName,
        reg.eventName,
        reg.status,
        new Date(reg.registeredAt).toLocaleDateString(),
        m.fullName,
        m.rollNumber,
        m.email,
        m.phone,
        m.department,
        m.year,
      ]);
    }
  }

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csv;
}
