'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Factory, ChevronLeft, ChevronRight,
  Tag, Gauge, Settings2, MessageSquare, FileText, DollarSign,
  ListChecks, ImageIcon, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { RequestQuoteModal } from '@/components/shared/RequestQuoteModal';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/i18n';
import {
  getLocalizedValue, getEntityCoverImage, getEntityGallery,
} from '@/lib/helpers';
import { formatPrice, convertPrice } from '@/lib/currency';
import type { ProductionLine, Machine } from '@/lib/types';

export function ProductionLineDetailPage() {
  const { locale, isRTL, currency, currentSlug, setCurrentPage, setCurrentSlug } = useAppStore();
  const t = getTranslations(locale);
  const [line, setLine] = useState<ProductionLine | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setActiveImage(0);
      try {
        const res = await fetch(`/api/production-lines/${currentSlug}`);
        if (res.ok) {
          const data = await res.json();
          // Slug endpoint returns { data: productionLine } (single object)
          const l = data.data || null;
          setLine(l);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentSlug]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-40 mb-8" />
          <Skeleton className="h-96 rounded-xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!line) {
    return (
      <div className="py-20 text-center">
        <Factory className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-lg text-muted-foreground">{t.common.noData}</p>
        <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => setCurrentPage('production-lines')}>
          {isRTL ? <ArrowRight className="mr-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {t.common.back}
        </Button>
      </div>
    );
  }

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const machines = (line.machines || []).map((mpl) => mpl.machine);

  // Build ordered image gallery: line cover + machine images in order
  const allImages: string[] = [];
  if (line.coverImage) allImages.push(line.coverImage);
  // Add production line own gallery images
  try {
    const lineImages = JSON.parse(line.images || '[]');
    if (Array.isArray(lineImages)) {
      for (const img of lineImages) {
        if (typeof img === 'string' && img !== line.coverImage) allImages.push(img);
      }
    }
  } catch { /* skip */ }
  // Add each machine's images in order
  for (const m of machines) {
    const cover = m.coverImage;
    if (cover && !allImages.includes(cover)) allImages.push(cover);
    try {
      const mImages = JSON.parse(m.images || '[]');
      if (Array.isArray(mImages)) {
        for (const img of mImages) {
          if (typeof img === 'string' && !allImages.includes(img)) allImages.push(img);
        }
      }
    } catch { /* skip */ }
  }

  // Parse line-level specs
  const lineSpecs: Array<{ key: string; value: string }> = (() => {
    if (!line.specs) return [];
    try {
      const parsed = JSON.parse(line.specs);
      if (parsed[locale] && Array.isArray(parsed[locale])) {
        return parsed[locale].map((s: Record<string, string>) => ({ key: s.key, value: s.value }));
      }
      if (Array.isArray(parsed)) {
        return parsed.map((s: Record<string, string>) => ({ key: s.key, value: s.value }));
      }
      return [];
    } catch { return []; }
  })();

  // Price
  const displayPrice = line.basePrice
    ? formatPrice(convertPrice(line.basePrice, line.currency || 'DZD', currency), currency as 'DZD' | 'USD' | 'EUR', locale)
    : null;

  // Machine spec parser
  const parseMachineSpecs = (machine: Machine): Array<{ key: string; value: string }> => {
    try {
      const raw = machine.specs;
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (parsed[locale] && Array.isArray(parsed[locale])) {
        return parsed[locale].map((s: Record<string, string>) => ({ key: s.key, value: s.value }));
      }
      if (Array.isArray(parsed)) {
        return parsed.map((s: Record<string, string>) => ({ key: s.key, value: s.value }));
      }
      return [];
    } catch { return []; }
  };

  const specLabel = locale === 'ar' ? 'المواصفات' : locale === 'fr' ? 'Spécifications' : 'Specifications';
  const lineSpecLabel = locale === 'ar' ? 'مواصفات خط الإنتاج' : locale === 'fr' ? 'Spécifications de la Ligne' : 'Production Line Specifications';
  const machineSpecLabel = locale === 'ar' ? 'مواصفات الآلة' : locale === 'fr' ? 'Spécifications de la Machine' : 'Machine Specifications';
  const machinesLabel = locale === 'ar' ? 'الآلات المشمولة' : locale === 'fr' ? 'Machines Incluses' : 'Included Machines';
  const galleryLabel = locale === 'ar' ? 'معرض الصور' : locale === 'fr' ? 'Galerie de Photos' : 'Photo Gallery';
  const sendMessageLabel = locale === 'ar' ? 'إرسال رسالة' : locale === 'fr' ? 'Envoyer un Message' : 'Send Message';

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => setCurrentPage('production-lines')} className="mb-6 cursor-pointer">
          <BackArrow className="mr-2 h-4 w-4" />
          {t.common.back}
        </Button>

        {/* ─── Cover / Image Gallery ─── */}
        <div className="rounded-xl overflow-hidden bg-muted mb-8">
          {allImages.length > 0 ? (
            <div>
              {/* Main image */}
              <div className="relative w-full h-64 sm:h-96 lg:h-[500px] bg-black/5">
                <img
                  src={allImages[activeImage]}
                  alt={getLocalizedValue(line.name, locale)}
                  className="w-full h-full object-contain"
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((p) => (p - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage((p) => (p + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/40 px-2 py-1 rounded-full">
                      {activeImage + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-background border-t">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 transition cursor-pointer ${
                        i === activeImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 sm:h-96 flex items-center justify-center">
              <ImageIcon className="h-20 w-20 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto">
          {/* ─── Title + Price ─── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {getLocalizedValue(line.name, locale)}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{line.status}</Badge>
                {line.featured && <Badge>{t.common.featured}</Badge>}
                {machines.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Package className="h-3 w-3" />
                    {machines.length} {locale === 'ar' ? 'آلة' : locale === 'fr' ? 'machines' : 'machines'}
                  </Badge>
                )}
              </div>
            </div>
            {displayPrice && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'السعر' : locale === 'fr' ? 'Prix' : 'Price'}
                </p>
                <p className="text-2xl font-bold text-primary">{displayPrice}</p>
              </div>
            )}
          </div>

          {/* ─── Description ─── */}
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-8">
            {getLocalizedValue(line.description, locale)}
          </p>

          <Separator className="my-8" />

          {/* ─── Production Line Specifications ─── */}
          {lineSpecs.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                {lineSpecLabel}
              </h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {lineSpecs.map((spec, i) => (
                      <div key={i} className={`flex items-center px-4 py-3 ${i % 2 === 0 ? 'bg-muted/30' : ''}`}>
                        <span className="font-medium text-sm w-1/3">{spec.key}</span>
                        <span className="text-sm text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── Included Machines with their specs ─── */}
          {machines.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {machinesLabel}
              </h2>
              <div className="space-y-6">
                {machines.map((m, idx) => {
                  const mSpecs = parseMachineSpecs(m);
                  const mCover = getEntityCoverImage(m);
                  const mPrice = m.basePrice
                    ? formatPrice(convertPrice(m.basePrice, m.currency || 'DZD', currency), currency as 'DZD' | 'USD' | 'EUR', locale)
                    : null;

                  return (
                    <Card key={m.id} className="overflow-hidden">
                      <div
                        className="flex flex-col lg:flex-row cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => { setCurrentSlug(m.slug); setCurrentPage('machine-detail'); }}
                      >
                        {/* Machine image */}
                        <div className="lg:w-64 h-48 lg:h-auto bg-muted flex-shrink-0">
                          {mCover ? (
                            <img src={mCover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Factory className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        {/* Machine info + specs */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground font-medium">
                                  #{idx + 1}
                                </span>
                                {m.machineType && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Settings2 className="h-3 w-3" />
                                    {m.machineType}
                                  </Badge>
                                )}
                                {m.capacity && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Gauge className="h-3 w-3" />
                                    {m.capacity}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-lg">{getLocalizedValue(m.name, locale)}</h3>
                            </div>
                            {mPrice && (
                              <p className="text-lg font-bold text-primary whitespace-nowrap ml-4">{mPrice}</p>
                            )}
                          </div>

                          {m.shortDesc && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {getLocalizedValue(m.shortDesc, locale)}
                            </p>
                          )}

                          {/* Machine specifications */}
                          {mSpecs.length > 0 && (
                            <div className="rounded-lg border overflow-hidden">
                              <div className="bg-muted/50 px-3 py-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  {machineSpecLabel}
                                </span>
                              </div>
                              <div className="divide-y">
                                {mSpecs.map((spec, si) => (
                                  <div key={si} className={`flex items-center px-3 py-2 text-sm ${si % 2 === 0 ? 'bg-muted/20' : ''}`}>
                                    <span className="font-medium w-1/3 text-muted-foreground">{spec.key}</span>
                                    <span className="flex-1">{spec.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <Separator className="my-8" />

          {/* ─── CTA Buttons ─── */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="cursor-pointer gap-2 min-w-[200px]"
              onClick={() => setQuoteOpen(true)}
            >
              <FileText className="h-5 w-5" />
              {t.machines.requestQuote}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer gap-2 min-w-[200px]"
              onClick={() => setCurrentPage('contact')}
            >
              <MessageSquare className="h-5 w-5" />
              {sendMessageLabel}
            </Button>
          </div>
        </div>
      </div>

      <RequestQuoteModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        machineName={getLocalizedValue(line.name, locale)}
      />
    </div>
  );
}
