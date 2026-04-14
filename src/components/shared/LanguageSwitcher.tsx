'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { LOCALE_FLAGS, LOCALE_LABELS } from '@/lib/constants';
import type { Locale } from '@/lib/types';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale, isRTL } = useAppStore();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-9 gap-1.5 px-2 text-sm font-medium cursor-pointer',
            isRTL && 'flex-row-reverse'
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="text-base leading-none">{LOCALE_FLAGS[locale]}</span>
          <span className="hidden sm:inline">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              'cursor-pointer gap-2',
              locale === loc && 'bg-accent'
            )}
          >
            <span className="text-base">{LOCALE_FLAGS[loc]}</span>
            <span>{LOCALE_LABELS[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
