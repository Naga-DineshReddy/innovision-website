// ============================================================
// INNOVISION — Type Definitions
// Phase 2: Supabase Backend Integration
// ============================================================

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  bannerUrl: string;
  category: EventCategory;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  eligibility: string;
  rules: string[];
  teamSizeMin: number;
  teamSizeMax: number;
  registrationDeadline: string | null;
  registrationEnabled: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;

  // Compat aliases used by Phase 1 components (mapped in service layer)
  name: string;
  date: string;
  time: string;
  bannerImage: string;
  maxTeamSize: number;
  minTeamSize: number;
}

export type EventCategory =
  | 'hackathon'
  | 'workshop'
  | 'competition'
  | 'seminar'
  | 'bootcamp'
  | 'tech-talk'
  | 'cultural';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: TeamCategory;
  profileImageUrl?: string;
  department?: string;
  year?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Compat aliases
  image?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
}

export type TeamCategory =
  | 'Faculty'
  | 'President'
  | 'Technical Team'
  | 'Secretariat'
  | 'Media Team'
  | 'Treasurer';

export interface Gallery {
  id: string;
  eventId: string | null;
  title: string;
  description: string;
  coverImageUrl: string;
  createdAt: string;
  updatedAt: string;
  imageCount?: number;

  // Compat aliases used by Phase 1 components
  eventName: string;
  eventDate: string;
  coverImage: string;
  images: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  galleryId: string;
  imageUrl: string;
  caption: string;
  displayOrder: number;
  createdAt: string;

  // Compat alias
  url: string;
}

// Keep old GalleryEvent as alias for Gallery
export type GalleryEvent = Gallery;

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Compat aliases
  image: string;
  active: boolean;
  order: number;
}

export interface Registration {
  id: string;
  registrationId: string;
  eventId: string;
  teamName: string;
  teamSize: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
  members: RegistrationMember[];

  // Compat aliases
  eventName: string;
  registrationDate: string;
}

export interface RegistrationMember {
  id?: string;
  registrationId?: string;
  fullName: string;
  rollNumber: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  memberNumber?: number;
  createdAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalGalleryPhotos: number;
  activeBanners: number;
  totalTeamMembers: number;
}
