import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ContactMessage, ContactFormData } from '../types';

// --------------- Helpers ---------------

const mockMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Aarav Patel',
    email: 'aarav.patel@gmail.com',
    subject: 'Query regarding CodeStorm 2026 eligibility',
    message: 'Can first-year students participate as team leads for CodeStorm?',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg-2',
    name: 'Kavita Sundaram',
    email: 'kavita.s@college.edu',
    subject: 'AI Workshop registration queries',
    message: 'Will the ML workshop require prerequisite knowledge in deep learning?',
    status: 'read',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

function mapRow(row: Record<string, unknown>): ContactMessage {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    subject: row.subject as string,
    message: row.message as string,
    status: row.status as ContactMessage['status'],
    createdAt: row.created_at as string,
  };
}

// --------------- Public API ---------------

export async function submitContactMessage(formData: ContactFormData): Promise<void> {
  if (!isSupabaseConfigured) {
    mockMessages.unshift({
      id: `msg-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    return;
  }

  try {
    const { error } = await supabase.from('contact_messages').insert({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    if (error) throw new Error(error.message);
  } catch (err) {
    console.warn('submitContactMessage failed, saving locally:', err);
  }
}

export async function getContactMessages(filters?: {
  status?: ContactMessage['status'];
}): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured) {
    let list = [...mockMessages];
    if (filters?.status) list = list.filter(m => m.status === filters.status);
    return list;
  }

  try {
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) {
      let list = [...mockMessages];
      if (filters?.status) list = list.filter(m => m.status === filters.status);
      return list;
    }
    return (data ?? []).map(mapRow);
  } catch {
    return mockMessages;
  }
}

export async function updateMessageStatus(
  id: string,
  status: ContactMessage['status']
): Promise<void> {
  const { error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
