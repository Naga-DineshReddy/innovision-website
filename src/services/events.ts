import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Event } from '../types';
import { mockEvents } from '../data/mockData';

// --------------- Helpers ---------------

/** Map a Supabase DB row to the Event interface (adds compat aliases). */
function mapRow(row: Record<string, unknown>): Event {
  const rules = (row.rules as string[] | null) ?? [];
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    description: row.description as string,
    shortDescription: row.short_description as string,
    bannerUrl: row.banner_url as string,
    category: row.category as Event['category'],
    eventDate: row.event_date as string,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
    venue: row.venue as string,
    eligibility: row.eligibility as string,
    rules,
    teamSizeMin: row.team_size_min as number,
    teamSizeMax: row.team_size_max as number,
    registrationDeadline: row.registration_deadline as string | null,
    registrationEnabled: row.registration_enabled as boolean,
    status: row.status as Event['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,

    // Compat aliases for Phase 1 components
    name: row.title as string,
    date: row.event_date as string,
    time: row.start_time ? `${row.start_time}${row.end_time ? ` - ${row.end_time}` : ''}` : '',
    bannerImage: row.banner_url as string,
    maxTeamSize: row.team_size_max as number,
    minTeamSize: row.team_size_min as number,
  };
}

/** Generate a URL-safe slug from a title. */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// --------------- Public API ---------------

export async function getEvents(filters?: {
  status?: Event['status'];
  category?: Event['category'];
}): Promise<Event[]> {
  if (!isSupabaseConfigured) {
    let list = [...mockEvents];
    if (filters?.status) list = list.filter(e => e.status === filters.status);
    if (filters?.category) list = list.filter(e => e.category === filters.category);
    return list;
  }

  try {
    let query = supabase.from('events').select('*').order('event_date', { ascending: false });
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.category) query = query.eq('category', filters.category);

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getEvents query failed, falling back to mock data:', error.message);
      let list = [...mockEvents];
      if (filters?.status) list = list.filter(e => e.status === filters.status);
      if (filters?.category) list = list.filter(e => e.category === filters.category);
      return list;
    }
    return (data ?? []).map(mapRow);
  } catch (err) {
    console.warn('getEvents network error, falling back to mock data:', err);
    return mockEvents;
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  if (!isSupabaseConfigured) {
    return mockEvents.find(e => e.id === id || e.slug === id) ?? mockEvents[0] ?? null;
  }

  try {
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
    if (error) {
      return mockEvents.find(e => e.id === id || e.slug === id) ?? null;
    }
    return mapRow(data);
  } catch {
    return mockEvents.find(e => e.id === id || e.slug === id) ?? null;
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (!isSupabaseConfigured) {
    return mockEvents.find(e => e.slug === slug) ?? null;
  }

  try {
    const { data, error } = await supabase.from('events').select('*').eq('slug', slug).single();
    if (error) {
      return mockEvents.find(e => e.slug === slug) ?? null;
    }
    return mapRow(data);
  } catch {
    return mockEvents.find(e => e.slug === slug) ?? null;
  }
}

export async function createEvent(
  eventData: Partial<Event> & { name?: string }
): Promise<Event> {
  const title = eventData.title || eventData.name || '';
  const slug = slugify(title) + '-' + Date.now();

  const { data, error } = await supabase
    .from('events')
    .insert({
      title,
      slug,
      description: eventData.description ?? '',
      short_description: eventData.shortDescription ?? eventData.shortDescription ?? '',
      banner_url: eventData.bannerUrl ?? eventData.bannerImage ?? '',
      category: eventData.category ?? 'hackathon',
      event_date: eventData.eventDate ?? eventData.date ?? new Date().toISOString().split('T')[0],
      start_time: eventData.startTime ?? eventData.time ?? '',
      end_time: eventData.endTime ?? '',
      venue: eventData.venue ?? '',
      eligibility: eventData.eligibility ?? '',
      rules: eventData.rules ?? [],
      team_size_min: eventData.teamSizeMin ?? eventData.minTeamSize ?? 1,
      team_size_max: eventData.teamSizeMax ?? eventData.maxTeamSize ?? 4,
      registration_deadline: eventData.registrationDeadline || null,
      registration_enabled: eventData.registrationEnabled ?? true,
      status: eventData.status ?? 'upcoming',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function updateEvent(
  id: string,
  eventData: Partial<Event> & { name?: string }
): Promise<Event> {
  const payload: Record<string, unknown> = {};

  if (eventData.title !== undefined || eventData.name !== undefined) {
    payload.title = eventData.title ?? eventData.name;
  }
  if (eventData.description !== undefined) payload.description = eventData.description;
  if (eventData.shortDescription !== undefined) payload.short_description = eventData.shortDescription;
  if (eventData.bannerUrl !== undefined || eventData.bannerImage !== undefined) {
    payload.banner_url = eventData.bannerUrl ?? eventData.bannerImage;
  }
  if (eventData.category !== undefined) payload.category = eventData.category;
  if (eventData.eventDate !== undefined || eventData.date !== undefined) {
    payload.event_date = eventData.eventDate ?? eventData.date;
  }
  if (eventData.startTime !== undefined || eventData.time !== undefined) {
    payload.start_time = eventData.startTime ?? eventData.time;
  }
  if (eventData.endTime !== undefined) payload.end_time = eventData.endTime;
  if (eventData.venue !== undefined) payload.venue = eventData.venue;
  if (eventData.eligibility !== undefined) payload.eligibility = eventData.eligibility;
  if (eventData.rules !== undefined) payload.rules = eventData.rules;
  if (eventData.teamSizeMin !== undefined || eventData.minTeamSize !== undefined) {
    payload.team_size_min = eventData.teamSizeMin ?? eventData.minTeamSize;
  }
  if (eventData.teamSizeMax !== undefined || eventData.maxTeamSize !== undefined) {
    payload.team_size_max = eventData.teamSizeMax ?? eventData.maxTeamSize;
  }
  if (eventData.registrationDeadline !== undefined) payload.registration_deadline = eventData.registrationDeadline || null;
  if (eventData.registrationEnabled !== undefined) payload.registration_enabled = eventData.registrationEnabled;
  if (eventData.status !== undefined) payload.status = eventData.status;

  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getRegistrationCount(eventId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_registration_count', { p_event_id: eventId });
  if (error) return 0;
  return data as number;
}
