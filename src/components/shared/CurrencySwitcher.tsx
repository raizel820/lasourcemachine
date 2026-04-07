'use client';

import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { CURRENCY_LABELS } from '@/lib/constants';
import { getCurrencySymbol } from '@/lib/currency';
import type { Currency } from '@/lib/types';
import { cn } from '@/lib/utils';

export function CurrencySwitcher() {
  const { currency, setCurrency, locale, isRTL } = useAppStore();

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  const currentSymbol = getCurrencySymbol(currency, locale);

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
          <DollarSign className="h-4 w-4" />
          <span>{currentSymbol}</span>
          <span className="hidden sm:inline">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {(Object.keys(CURRENCY_LABELS) as Currency[]).map((curr) => (
          <DropdownMenuItem
            key={curr}
            onClick={() => handleCurrencyChange(curr)}
            className={cn(
              'cursor-pointer gap-2',
              currency === curr && 'bg-accent'
            )}
          >
            <span className="font-medium">{curr}</span>
            <span className="text-muted-foreground">{CURRENCY_LABELS[curr]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
