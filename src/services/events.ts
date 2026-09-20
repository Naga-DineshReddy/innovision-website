import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Event } from '../types';
import { mockEvents } from '../data/mockData';

// --------------- Helpers ---------------

/** Map a Supabase DB row to the Event interface (adds compat aliases). */
function mapRow(row: Record<string, unknown>): Event {
  const rules = (row.rules as string[] | null) ?? [];
  const eventDate = row.event_date ? String(row.event_date).split('T')[0] : '';
  const regDeadline = row.registration_deadline ? String(row.registration_deadline).split('T')[0] : null;

  return {
    id: row.id as string,
    title: (row.title as string) || '',
    slug: (row.slug as string) || '',
    description: (row.description as string) || '',
    shortDescription: (row.short_description as string) || '',
    bannerUrl: (row.banner_url as string) || '',
    category: (row.category as Event['category']) || 'hackathon',
    eventDate,
    startTime: (row.start_time as string) || '',
    endTime: (row.end_time as string) || '',
    venue: (row.venue as string) || '',
    eligibility: (row.eligibility as string) || '',
    rules,
    teamSizeMin: (row.team_size_min as number) ?? 1,
    teamSizeMax: (row.team_size_max as number) ?? 4,
    registrationDeadline: regDeadline,
    registrationEnabled: (row.registration_enabled as boolean) ?? true,
    status: (row.status as Event['status']) || 'upcoming',
    createdAt: (row.created_at as string) || '',
    updatedAt: (row.updated_at as string) || '',

    // Compat aliases for Phase 1 components
    name: (row.title as string) || '',
    date: eventDate,
    time: row.start_time ? `${row.start_time}${row.end_time ? ` - ${row.end_time}` : ''}` : '',
    bannerImage: (row.banner_url as string) || '',
    maxTeamSize: (row.team_size_max as number) ?? 4,
    minTeamSize: (row.team_size_min as number) ?? 1,
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
  const title = eventData.title || eventData.name || 'Untitled Event';
  const slug = slugify(title) + '-' + Date.now();
  const rawDate = eventData.eventDate || eventData.date || new Date().toISOString().split('T')[0];
  const eventDate = String(rawDate).split('T')[0];
  const startTime = eventData.startTime || eventData.time || '';
  const bannerUrl = eventData.bannerUrl || eventData.bannerImage || '';
  const minTeam = eventData.teamSizeMin ?? eventData.minTeamSize ?? 1;
  const maxTeam = eventData.teamSizeMax ?? eventData.maxTeamSize ?? 4;
  const deadline = eventData.registrationDeadline ? String(eventData.registrationDeadline).split('T')[0] : null;

  if (!isSupabaseConfigured) {
    const newEvent: Event = {
      id: 'e-' + Date.now(),
      title,
      slug,
      description: eventData.description ?? '',
      shortDescription: eventData.shortDescription ?? '',
      bannerUrl,
      category: eventData.category ?? 'hackathon',
      eventDate,
      startTime,
      endTime: eventData.endTime ?? '',
      venue: eventData.venue ?? '',
      eligibility: eventData.eligibility ?? '',
      rules: eventData.rules ?? [],
      teamSizeMin: minTeam,
      teamSizeMax: maxTeam,
      registrationDeadline: deadline,
      registrationEnabled: eventData.registrationEnabled ?? true,
      status: eventData.status ?? 'upcoming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: title,
      date: eventDate,
      time: startTime,
      bannerImage: bannerUrl,
      minTeamSize: minTeam,
      maxTeamSize: maxTeam,
    };
    mockEvents.unshift(newEvent);
    return newEvent;
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title,
      slug,
      description: eventData.description ?? '',
      short_description: eventData.shortDescription ?? '',
      banner_url: bannerUrl,
      category: eventData.category ?? 'hackathon',
      event_date: eventDate,
      start_time: startTime,
      end_time: eventData.endTime ?? '',
      venue: eventData.venue ?? '',
      eligibility: eventData.eligibility ?? '',
      rules: eventData.rules ?? [],
      team_size_min: minTeam,
      team_size_max: maxTeam,
      registration_deadline: deadline,
      registration_enabled: eventData.registrationEnabled ?? true,
      status: eventData.status ?? 'upcoming',
    })
    .select()
    .single();

  if (error) {
    // If Supabase insert fails, gracefully fallback
    console.error('Supabase createEvent error:', error.message);
    throw new Error(error.message);
  }
  return mapRow(data);
}

export async function updateEvent(
  id: string,
  eventData: Partial<Event> & { name?: string }
): Promise<Event> {
  const payload: Record<string, unknown> = {};

  if (eventData.title !== undefined || eventData.name !== undefined) {
    payload.title = eventData.title || eventData.name;
  }
  if (eventData.description !== undefined) payload.description = eventData.description;
  if (eventData.shortDescription !== undefined) payload.short_description = eventData.shortDescription;
  if (eventData.bannerUrl !== undefined || eventData.bannerImage !== undefined) {
    payload.banner_url = eventData.bannerUrl || eventData.bannerImage;
  }
  if (eventData.category !== undefined) payload.category = eventData.category;
  if (eventData.eventDate !== undefined || eventData.date !== undefined) {
    const d = eventData.eventDate || eventData.date;
    payload.event_date = d ? String(d).split('T')[0] : null;
  }
  if (eventData.startTime !== undefined || eventData.time !== undefined) {
    payload.start_time = eventData.startTime || eventData.time;
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
  if (eventData.registrationDeadline !== undefined) {
    const dl = eventData.registrationDeadline;
    payload.registration_deadline = dl ? String(dl).split('T')[0] : null;
  }
  if (eventData.registrationEnabled !== undefined) payload.registration_enabled = eventData.registrationEnabled;
  if (eventData.status !== undefined) payload.status = eventData.status;

  if (!isSupabaseConfigured) {
    const idx = mockEvents.findIndex(e => e.id === id || e.slug === id);
    if (idx !== -1) {
      const updated: Event = {
        ...mockEvents[idx],
        ...eventData,
        title: (payload.title as string) ?? mockEvents[idx].title,
        name: (payload.title as string) ?? mockEvents[idx].name,
        date: (payload.event_date as string) ?? mockEvents[idx].date,
        eventDate: (payload.event_date as string) ?? mockEvents[idx].eventDate,
        bannerUrl: (payload.banner_url as string) ?? mockEvents[idx].bannerUrl,
        bannerImage: (payload.banner_url as string) ?? mockEvents[idx].bannerImage,
        startTime: (payload.start_time as string) ?? mockEvents[idx].startTime,
        time: (payload.start_time as string) ?? mockEvents[idx].time,
        teamSizeMin: (payload.team_size_min as number) ?? mockEvents[idx].teamSizeMin,
        minTeamSize: (payload.team_size_min as number) ?? mockEvents[idx].minTeamSize,
        teamSizeMax: (payload.team_size_max as number) ?? mockEvents[idx].teamSizeMax,
        maxTeamSize: (payload.team_size_max as number) ?? mockEvents[idx].maxTeamSize,
        updatedAt: new Date().toISOString(),
      };
      mockEvents[idx] = updated;
      return updated;
    }
  }

  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // If updating Supabase fails because the event only exists in mock data
    const idx = mockEvents.findIndex(e => e.id === id || e.slug === id);
    if (idx !== -1) {
      const updated: Event = {
        ...mockEvents[idx],
        ...eventData,
        title: (payload.title as string) ?? mockEvents[idx].title,
        name: (payload.title as string) ?? mockEvents[idx].name,
        date: (payload.event_date as string) ?? mockEvents[idx].date,
        eventDate: (payload.event_date as string) ?? mockEvents[idx].eventDate,
        bannerUrl: (payload.banner_url as string) ?? mockEvents[idx].bannerUrl,
        bannerImage: (payload.banner_url as string) ?? mockEvents[idx].bannerImage,
        startTime: (payload.start_time as string) ?? mockEvents[idx].startTime,
        time: (payload.start_time as string) ?? mockEvents[idx].time,
        teamSizeMin: (payload.team_size_min as number) ?? mockEvents[idx].teamSizeMin,
        minTeamSize: (payload.team_size_min as number) ?? mockEvents[idx].minTeamSize,
        teamSizeMax: (payload.team_size_max as number) ?? mockEvents[idx].teamSizeMax,
        maxTeamSize: (payload.team_size_max as number) ?? mockEvents[idx].maxTeamSize,
        updatedAt: new Date().toISOString(),
      };
      mockEvents[idx] = updated;
      return updated;
    }
    throw new Error(error.message);
  }
  return mapRow(data);
}

export async function deleteEvent(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const idx = mockEvents.findIndex(e => e.id === id || e.slug === id);
    if (idx !== -1) mockEvents.splice(idx, 1);
    return;
  }

  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) {
    const idx = mockEvents.findIndex(e => e.id === id || e.slug === id);
    if (idx !== -1) {
      mockEvents.splice(idx, 1);
      return;
    }
    throw new Error(error.message);
  }
}

export async function getRegistrationCount(eventId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_registration_count', { p_event_id: eventId });
  if (error) return 0;
  return data as number;
}
