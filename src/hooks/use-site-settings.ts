'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { COMPANY } from '@/lib/constants';
import type { Locale } from '@/lib/types';

interface SiteSettings {
  company_phone: string;
  company_email: string;
  company_whatsapp: string;
  company_address: string;
  company_website: string;
  company_name_fr: string;
  company_name_en: string;
  company_name_ar: string;
  company_description_fr: string;
  company_description_en: string;
  company_description_ar: string;
  social_facebook: string;
  social_linkedin: string;
  social_instagram: string;
  social_youtube: string;
  social_twitter: string;
  working_hours_fr: string;
  working_hours_en: string;
  working_hours_ar: string;
  stats_years: string;
  stats_machines: string;
  stats_clients: string;
  stats_countries: string;
  [key: string]: string;
}

// ---- Reactive cache invalidation system ----
let cachedSettings: SiteSettings | null = null;
let cacheTimestamp = 0;
let settingsVersion = 0;

const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

/** Force-invalidate the settings cache so ALL components re-fetch immediately */
export function invalidateSettingsCache() {
  cachedSettings = null;
  cacheTimestamp = 0;
  settingsVersion += 1;
  notifySubscribers();
}

async function fetchSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`/api/settings?_v=${settingsVersion}&_t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      return data.data || null;
    }
  } catch {
    // Silently fail — fallback to constants
  }
  return null;
}

/**
 * Hook to fetch and use live site settings from the database.
 * Falls back to COMPANY constants if settings haven't been saved yet.
 *
 * Automatically re-fetches when:
 * - Component first mounts
 * - Cache is older than 5 minutes
 * - invalidateSettingsCache() is called (from admin settings save)
 */
export function useSiteSettings() {
  // Initialize from cache synchronously (no effect needed)
  const [settings, setSettings] = useState<SiteSettings | null>(cachedSettings);
  const [loaded, setLoaded] = useState(() => !!cachedSettings);
  // Track version to detect external invalidations
  const [localVersion, setLocalVersion] = useState(settingsVersion);
  // Ref to prevent double-fetching
  const fetchedVersion = useRef(settingsVersion);

  // Subscribe to cache invalidations — only calls setState in a callback from external system
  useEffect(() => {
    const callback = () => {
      // Trigger re-render with new version; the fetch effect will run after
      setLocalVersion(settingsVersion);
    };
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  }, []);

  // Fetch effect — only runs when localVersion changes (invalidation or mount)
  useEffect(() => {
    // Skip if we already fetched this version and have cached data
    if (fetchedVersion.current === settingsVersion && cachedSettings) return;

    const STALE_MS = 5 * 60 * 1000;
    // If cache is fresh, don't re-fetch
    if (cachedSettings && Date.now() - cacheTimestamp < STALE_MS && fetchedVersion.current === settingsVersion) return;

    let cancelled = false;

    (async () => {
      const data = await fetchSettings();
      if (cancelled) return;
      if (data) {
        cachedSettings = data;
        cacheTimestamp = Date.now();
      }
      fetchedVersion.current = settingsVersion;
      setSettings(cachedSettings);
      setLoaded(true);
    })();

    return () => { cancelled = true; };
  }, [localVersion]);

  const get = useCallback((key: string, fallback: string): string => {
    if (settings && settings[key]) return settings[key];
    return fallback;
  }, [settings]);

  const statsYears = parseInt(settings?.stats_years || '15', 10) || 15;
  const statsMachines = parseInt(settings?.stats_machines || '500', 10) || 500;
  const statsClients = parseInt(settings?.stats_clients || '200', 10) || 200;
  const statsCountries = parseInt(settings?.stats_countries || '10', 10) || 10;

  return {
    settings: settings || {},
    loaded,
    get,
    stats: { years: statsYears, machines: statsMachines, clients: statsClients, countries: statsCountries },
    phone: settings?.company_phone || COMPANY.phone,
    email: settings?.company_email || COMPANY.email,
    whatsapp: settings?.company_whatsapp || COMPANY.whatsapp,
    address: settings?.company_address || COMPANY.address,
    website: settings?.company_website || COMPANY.website,
    facebook: settings?.social_facebook || COMPANY.facebook,
    linkedin: settings?.social_linkedin || COMPANY.linkedin,
    companyName: useCallback((locale: Locale) => {
      if (locale === 'ar') return settings?.company_name_ar || COMPANY.nameAr;
      if (locale === 'en') return settings?.company_name_en || COMPANY.name;
      return settings?.company_name_fr || COMPANY.name;
    }, [settings]),
    description: useCallback((locale: Locale) => {
      if (locale === 'ar') return settings?.company_description_ar || COMPANY.description.ar;
      if (locale === 'en') return settings?.company_description_en || COMPANY.description.en;
      return settings?.company_description_fr || COMPANY.description.fr;
    }, [settings]),
    workingHours: useCallback((locale: Locale) => {
      if (locale === 'ar') return settings?.working_hours_ar || COMPANY.workingHours.ar;
      if (locale === 'en') return settings?.working_hours_en || COMPANY.workingHours.en;
      return settings?.working_hours_fr || COMPANY.workingHours.fr;
    }, [settings]),
  };
}
