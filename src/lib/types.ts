// ============================================================
// Core types for the multilingual industrial company website
// ============================================================

/** Supported locales */
export type Locale = 'en' | 'fr' | 'ar';

/** Supported currencies */
export type Currency = 'DZD' | 'USD' | 'EUR';

/** A string that has translations in all supported locales */
export type TranslatableString = Record<Locale, string>;

/** A string that may have translations in some locales */
export type PartialTranslatableString = Partial<Record<Locale, string>>;

// ============================================================
// Database Model Types (mirrors Prisma schema)
// ============================================================

/** Machine category */
export interface Category {
  id: string;
  name: string; // TranslatableString JSON
  slug: string;
  description?: string; // TranslatableString JSON
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Industrial machine */
export interface Machine {
  id: string;
  name: string; // TranslatableString JSON
  slug: string;
  description: string; // TranslatableString JSON
  shortDescription?: string; // TranslatableString JSON
  categoryId: string;
  category?: Category;
  price: number;
  currency: Currency;
  images: string; // JSON array of image URLs
  specifications: string; // JSON array of { key: TranslatableString, value: string }
  features?: string; // TranslatableString JSON (array)
  status: 'available' | 'sold' | 'reserved' | 'discontinued';
  isFeatured: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Production line (bundle of machines) */
export interface ProductionLine {
  id: string;
  name: string; // TranslatableString JSON
  slug: string;
  description: string; // TranslatableString JSON
  shortDescription?: string; // TranslatableString JSON
  images: string; // JSON array of image URLs
  machines: string; // JSON array of machine IDs
  specifications?: string; // JSON
  capacity?: string; // TranslatableString JSON
  status: 'available' | 'reserved' | 'sold';
  isFeatured: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** News / blog post */
export interface NewsPost {
  id: string;
  title: string; // TranslatableString JSON
  slug: string;
  content: string; // TranslatableString JSON
  excerpt?: string; // TranslatableString JSON
  coverImage?: string;
  images?: string; // JSON array
  author?: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Project portfolio entry */
export interface Project {
  id: string;
  title: string; // TranslatableString JSON
  slug: string;
  description: string; // TranslatableString JSON
  shortDescription?: string; // TranslatableString JSON
  clientName?: string;
  location?: string; // TranslatableString JSON
  coverImage?: string;
  images: string; // JSON array
  machines?: string; // JSON array of machine IDs
  productionLines?: string; // JSON array of production line IDs
  startDate?: Date;
  completionDate?: Date;
  status: 'completed' | 'in_progress' | 'planning';
  isFeatured: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Service offering */
export interface Service {
  id: string;
  name: string; // TranslatableString JSON
  slug: string;
  description: string; // TranslatableString JSON
  shortDescription?: string; // TranslatableString JSON
  icon?: string;
  image?: string;
  features?: string; // JSON array of TranslatableString
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Business partner */
export interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string; // TranslatableString JSON
  country?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Frequently asked question */
export interface FAQ {
  id: string;
  question: string; // TranslatableString JSON
  answer: string; // TranslatableString JSON
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Lead / inquiry submitted via contact form */
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  machineId?: string;
  machine?: Machine;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Media file in the media library */
export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string; // TranslatableString JSON
  folder?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Site-wide setting */
export interface SiteSetting {
  id: string;
  key: string;
  value: string; // JSON
  type: 'text' | 'json' | 'image' | 'boolean';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Filter & Pagination Types
// ============================================================

/** Machine filter parameters */
export interface MachineFilters {
  category?: string;
  type?: string;
  search?: string;
  status?: 'available' | 'sold' | 'reserved' | 'discontinued';
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'order';
  sortOrder?: 'asc' | 'desc';
}

/** Generic paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// Form Types
// ============================================================

/** Contact form input */
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
}

/** Quote request form input */
export interface QuoteRequestData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  machineId: string;
  message?: string;
}
