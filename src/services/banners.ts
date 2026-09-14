import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Banner } from '../types';
import { mockBanners } from '../data/mockData';

// --------------- Helpers ---------------

function mapRow(row: Record<string, unknown>): Banner {
  return {
    id: row.id as string,
    title: row.title as string,
    subtitle: row.subtitle as string,
    imageUrl: row.image_url as string,
    buttonText: row.button_text as string,
    buttonLink: row.button_link as string,
    displayOrder: row.display_order as number,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,

    // Compat aliases
    image: row.image_url as string,
    active: row.is_active as boolean,
    order: row.display_order as number,
  };
}

// --------------- Public API ---------------

export async function getActiveBanners(): Promise<Banner[]> {
  if (!isSupabaseConfigured) {
    return mockBanners.filter(b => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.warn('Supabase getActiveBanners failed, using mock data:', error.message);
      return mockBanners.filter(b => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return (data ?? []).map(mapRow);
  } catch (err) {
    console.warn('getActiveBanners network error, using mock data:', err);
    return mockBanners;
  }
}

export async function getAllBanners(): Promise<Banner[]> {
  if (!isSupabaseConfigured) {
    return mockBanners.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order');

    if (error) {
      console.warn('Supabase getAllBanners failed, using mock data:', error.message);
      return mockBanners;
    }
    return (data ?? []).map(mapRow);
  } catch {
    return mockBanners;
  }
}

export async function createBanner(bannerData: Partial<Banner>): Promise<Banner> {
  const { data, error } = await supabase
    .from('banners')
    .insert({
      title: bannerData.title ?? '',
      subtitle: bannerData.subtitle ?? '',
      image_url: bannerData.imageUrl ?? bannerData.image ?? '',
      button_text: bannerData.buttonText ?? '',
      button_link: bannerData.buttonLink ?? '',
      display_order: bannerData.displayOrder ?? bannerData.order ?? 0,
      is_active: bannerData.isActive ?? bannerData.active ?? true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function updateBanner(id: string, bannerData: Partial<Banner>): Promise<Banner> {
  const payload: Record<string, unknown> = {};

  if (bannerData.title !== undefined) payload.title = bannerData.title;
  if (bannerData.subtitle !== undefined) payload.subtitle = bannerData.subtitle;
  if (bannerData.imageUrl !== undefined || bannerData.image !== undefined) {
    payload.image_url = bannerData.imageUrl ?? bannerData.image;
  }
  if (bannerData.buttonText !== undefined) payload.button_text = bannerData.buttonText;
  if (bannerData.buttonLink !== undefined) payload.button_link = bannerData.buttonLink;
  if (bannerData.displayOrder !== undefined || bannerData.order !== undefined) {
    payload.display_order = bannerData.displayOrder ?? bannerData.order;
  }
  if (bannerData.isActive !== undefined || bannerData.active !== undefined) {
    payload.is_active = bannerData.isActive ?? bannerData.active;
  }

  const { data, error } = await supabase
    .from('banners')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function toggleBannerActive(id: string, currentActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('banners')
    .update({ is_active: !currentActive })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
