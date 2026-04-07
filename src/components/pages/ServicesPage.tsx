'use client';

import { useState, useEffect } from 'react';
import { Wrench, Ship, Settings, GraduationCap, ClipboardList, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/i18n';
import { getLocalizedValue, getLocalizedArray } from '@/lib/helpers';
import type { Service } from '@/lib/types';

const SERVICE_ICONS = [Wrench, Ship, Settings, GraduationCap, ClipboardList];

const DEFAULT_SERVICES = [
  { icon: 'wrench', title: { en: 'Installation & Setup', fr: 'Installation & Mise en Service', ar: 'التركيب والتشغيل' }, desc: { en: 'Professional installation and commissioning of all types of industrial machines and production lines.', fr: 'Installation professionnelle et mise en service de tous types de machines industrielles et lignes de production.', ar: 'تركيب احترافي وتشغيل جميع أنواع الآلات الصناعية وخطوط الإنتاج.' }, features: ['Site assessment', 'Professional installation', 'Testing & commissioning'] },
  { icon: 'ship', title: { en: 'Spare Parts Supply', fr: 'Fourniture de Pièces Détachées', ar: 'توريد قطع الغيار' }, desc: { en: 'Quick and reliable supply of genuine spare parts for all machine brands and models.', fr: 'Approvisionnement rapide et fiable de pièces détachées d\'origine pour toutes les marques et modèles de machines.', ar: 'توريد سريع وموثوق لقطع الغيار الأصلية لجميع العلامات التجارية والنماذج.' }, features: ['OEM parts', 'Fast delivery', 'Technical support'] },
  { icon: 'settings', title: { en: 'Maintenance & Repair', fr: 'Maintenance & Réparation', ar: 'الصيانة والإصلاح' }, desc: { en: 'Preventive and corrective maintenance services to ensure optimal machine performance.', fr: 'Services de maintenance préventive et corrective pour assurer des performances optimales des machines.', ar: 'خدمات صيانة وقائية وتصحيحية لضمان الأداء الأمثل للآلات.' }, features: ['Preventive maintenance', 'Emergency repair', 'Performance optimization'] },
  { icon: 'graduation', title: { en: 'Technical Training', fr: 'Formation Technique', ar: 'التدريب الفني' }, desc: { en: 'Comprehensive training programs for operators and maintenance technicians.', fr: 'Programmes de formation complets pour les opérateurs et techniciens de maintenance.', ar: 'برامج تدريب شاملة للمشغلين وفنيي الصيانة.' }, features: ['Operator training', 'Safety courses', 'Certification programs'] },
  { icon: 'clipboard', title: { en: 'Consulting & Engineering', fr: 'Conseil & Ingénierie', ar: 'الاستشارات والهندسة' }, desc: { en: 'Expert consulting services for plant design, process optimization, and industrial automation.', fr: 'Services de conseil expert pour la conception d\'usines, l\'optimisation des processus et l\'automatisation industrielle.', ar: 'خدمات استشارية متخصصة لتصميم المصانع وتحسين العمليات والأتمتة الصناعية.' }, features: ['Plant design', 'Process optimization', 'Automation solutions'] },
];

export function ServicesPage() {
  const { locale, setCurrentPage } = useAppStore();
  const t = getTranslations(locale);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/api/services?limit=20');
        if (res.ok) {
          const data = await res.json();
          setServices(data.data || data.services || []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayServices = services.length > 0 ? services : DEFAULT_SERVICES;

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">{t.services.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t.services.subtitle}</p>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {displayServices.map((service, i) => {
                const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
                const isFromApi = 'id' in service && 'name' in service && 'description' in service && typeof service.name === 'string';
                const name = isFromApi ? getLocalizedValue((service as Service).name, locale) : service.title[locale] || service.title.en;
                const desc = isFromApi ? getLocalizedValue((service as Service).description, locale) : service.desc[locale] || service.desc.en;
                const features = isFromApi ? getLocalizedArray((service as Service).features || '', locale) : service.features;
                const isReversed = i % 2 !== 0;

                return (
                  <Card key={isFromApi ? (service as Service).id : i} className="overflow-hidden">
                    <div className={`grid grid-cols-1 lg:grid-cols-2 ${isReversed ? 'lg:grid-flow-dense' : ''}`}>
                      {/* Icon / Visual */}
                      <div className={`flex items-center justify-center p-8 lg:p-12 ${isReversed ? 'lg:col-start-2' : ''} bg-gradient-to-br from-primary/5 to-primary/10`}>
                        <div className="text-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
                            <Icon className="h-10 w-10" />
                          </div>
                          <Badge variant="secondary" className="mb-2">
                            {String(i + 1).padStart(2, '0')}
                          </Badge>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-3">{name}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">{desc}</p>
                        {features.length > 0 && (
                          <ul className="space-y-2">
                            {features.map((f, fi) => (
                              <li key={fi} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-primary shrink-0" />
                                <span>{typeof f === 'string' ? f : String(f)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-10 lg:p-16">
            <h2 className="text-2xl font-bold text-white mb-3">{t.cta.title}</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">{t.cta.subtitle}</p>
            <Button size="lg" variant="secondary" onClick={() => setCurrentPage('contact')} className="cursor-pointer">
              {t.cta.button}
              <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180 rtl:ml-0 rtl:mr-2" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
