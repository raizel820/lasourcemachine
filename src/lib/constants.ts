import type { Locale, Currency } from './types';

// ============================================================
// Company Information
// ============================================================

export const COMPANY = {
  /** Company legal name */
  name: 'LA SOURCE MACHIEN',
  /** Company name in Arabic */
  nameAr: 'مصدر الآلات',
  /** Company tagline / slogan */
  tagline: {
    en: 'Industrial Machinery & Production Lines',
    fr: 'Machines Industrielles & Lignes de Production',
    ar: 'الآلات الصناعية وخطوط الإنتاج',
  } as const,
  /** Full company description */
  description: {
    en: 'Leading supplier of industrial machinery, production lines, and turnkey solutions in Algeria and North Africa.',
    fr: "Fournisseur leader de machines industrielles, lignes de production et solutions clés en main en Algérie et en Afrique du Nord.",
    ar: 'المورد الرائد للآلات الصناعية وخطوط الإنتاج والحلول الجاهزة في الجزائر وشمال أفريقيا.',
  } as const,
  /** Business address */
  address: 'Zone Industrielle, Rouiba, Alger, Algeria',
  /** Phone number */
  phone: '+213 23 45 67 89',
  /** WhatsApp number (may differ from phone) */
  whatsapp: '+213 555 123 456',
  /** Contact email */
  email: 'contact@lasourcemachien.dz',
  /** Company website URL */
  website: 'https://www.lasourcemachien.dz',
  /** Facebook page URL */
  facebook: 'https://www.facebook.com/lasourcemachien',
  /** LinkedIn page URL */
  linkedin: 'https://www.linkedin.com/company/lasourcemachien',
  /** Geographic coordinates (Algeria) */
  location: {
    lat: 36.7525,
    lng: 3.042,
  },
  /** Working hours */
  workingHours: {
    en: 'Sunday – Thursday: 8:00 AM – 5:00 PM',
    fr: 'Dimanche – Jeudi : 8h00 – 17h00',
    ar: 'الأحد – الخميس: 8:00 ص – 5:00 م',
  } as const,
} as const;

// ============================================================
// Locale & Language Settings
// ============================================================

/** Default locale for the website */
export const DEFAULT_LOCALE: Locale = 'fr';

/** All supported locales */
export const SUPPORTED_LOCALES: Locale[] = ['en', 'fr', 'ar'];

/** Locales that use RTL direction */
export const RTL_LOCALES: Locale[] = ['ar'];

/** Locale display labels (for language switcher) */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

/** Locale flags (emoji) for the language switcher */
export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇩🇿',
};

// ============================================================
// Currency Settings
// ============================================================

/** All available currencies */
export const AVAILABLE_CURRENCIES: Currency[] = ['DZD', 'USD', 'EUR'];

/** Currency display labels */
export const CURRENCY_LABELS: Record<Currency, string> = {
  DZD: 'Dinar Algérien (DA)',
  USD: 'US Dollar ($)',
  EUR: 'Euro (€)',
};

// ============================================================
// App Paths
// ============================================================

/** Admin dashboard base path */
export const ADMIN_PATH = '/eurl/lasource';

/** Admin sub-routes */
export const ADMIN_ROUTES = {
  dashboard: `${ADMIN_PATH}`,
  machines: `${ADMIN_PATH}/machines`,
  productionLines: `${ADMIN_PATH}/production-lines`,
  news: `${ADMIN_PATH}/news`,
  projects: `${ADMIN_PATH}/projects`,
  services: `${ADMIN_PATH}/services`,
  partners: `${ADMIN_PATH}/partners`,
  media: `${ADMIN_PATH}/media`,
  leads: `${ADMIN_PATH}/leads`,
  settings: `${ADMIN_PATH}/settings`,
} as const;

// ============================================================
// Pagination & Display
// ============================================================

/** Default number of items per page for lists */
export const DEFAULT_PAGE_SIZE = 12;

/** Maximum number of items per page */
export const MAX_PAGE_SIZE = 50;

/** Number of featured items to show in homepage sections */
export const FEATURED_COUNT = 6;

// ============================================================
// File Upload Limits
// ============================================================

/** Maximum file upload size in bytes (10 MB) */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/** Allowed document MIME types */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ============================================================
// SEO & Meta
// ============================================================

/** Default page title suffix */
export const META_TITLE_SUFFIX = ' | LA SOURCE MACHIEN';

/** Default OG image */
export const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

/** Default meta description */
export const DEFAULT_META_DESCRIPTION = {
  en: 'LA SOURCE MACHIEN - Your trusted partner for industrial machinery and production lines in Algeria.',
  fr: 'LA SOURCE MACHIEN - Votre partenaire de confiance pour les machines industrielles et lignes de production en Algérie.',
  ar: 'مصدر الآلات - شريكك الموثوق للآلات الصناعية وخطوط الإنتاج في الجزائر.',
} as const;
