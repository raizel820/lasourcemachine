import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale, Currency } from './types';

interface AppState {
  /** Current UI locale */
  locale: Locale;
  /** Preferred display currency */
  currency: Currency;
  /** Mobile navigation open state */
  mobileNavOpen: boolean;
  /** Current client-side page */
  currentPage: string;
  /** Current slug for detail pages */
  currentSlug: string;
  /** Current category filter for machines */
  currentCategoryFilter: string;
  /** Current page number for paginated views */
  currentPageNumber: number;
  /** Whether the user is logged in as admin */
  isAdmin: boolean;
  /** Admin auth token */
  adminToken: string | null;

  /** Set UI locale */
  setLocale: (locale: Locale) => void;
  /** Set display currency */
  setCurrency: (currency: Currency) => void;
  /** Toggle mobile navigation */
  setMobileNavOpen: (open: boolean) => void;
  /** Navigate to a page */
  setCurrentPage: (page: string) => void;
  /** Set the slug for detail pages */
  setCurrentSlug: (slug: string) => void;
  /** Set category filter */
  setCurrentCategoryFilter: (category: string) => void;
  /** Set page number */
  setCurrentPageNumber: (page: number) => void;
  /** Whether the current locale is RTL */
  isRTL: boolean;
  /** Set admin auth state */
  setAdminAuth: (isAdmin: boolean, token: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: 'fr',
      currency: 'DZD',
      mobileNavOpen: false,
      currentPage: 'home',
      currentSlug: '',
      currentCategoryFilter: '',
      currentPageNumber: 1,
      isAdmin: false,
      adminToken: null,

      setLocale: (locale) => {
        // Update document direction and lang attribute
        if (typeof document !== 'undefined') {
          const isRTL = locale === 'ar';
          document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
          document.documentElement.lang = locale;
        }
        set({ locale, isRTL: locale === 'ar' });
      },

      setCurrency: (currency) => set({ currency }),

      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

      setCurrentPage: (page) => {
        set({ currentPage: page, currentPageNumber: 1 });
        // Scroll to top
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },

      setCurrentSlug: (slug) => set({ currentSlug: slug }),

      setCurrentCategoryFilter: (category) => set({ currentCategoryFilter: category, currentPageNumber: 1 }),

      setCurrentPageNumber: (page) => set({ currentPageNumber: page }),

      isRTL: false, // computed lazily via get(); default false, updated by setLocale

      setAdminAuth: (isAdmin, token) => set({ isAdmin, adminToken: token }),
    }),
    {
      name: 'la-source-machien-store',
      partialize: (state) => ({
        locale: state.locale,
        currency: state.currency,
        isAdmin: state.isAdmin,
        adminToken: state.adminToken,
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (!error && _state) {
            // Apply direction on rehydration
            if (typeof document !== 'undefined') {
              const isRTL = _state.locale === 'ar';
              document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
              document.documentElement.lang = _state.locale;
            }
          }
        };
      },
    }
  )
);
