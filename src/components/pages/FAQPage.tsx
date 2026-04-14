'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/i18n';
import { getLocalizedValue } from '@/lib/helpers';
import type { FAQ } from '@/lib/types';

export function FAQPage() {
  const { locale, setCurrentPage } = useAppStore();
  const t = getTranslations(locale);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/api/faqs');
        if (res.ok) {
          const data = await res.json();
          setFaqs(data.data || data.faqs || []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">{t.faq.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t.faq.subtitle}</p>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">{locale === 'ar' ? 'لا توجد أسئلة شائعة حالياً' : locale === 'fr' ? 'Aucune FAQ disponible' : 'No FAQs available'}</p>
              <p className="text-sm mt-1">{locale === 'ar' ? 'ترقبوا المزيد قريباً' : locale === 'fr' ? 'Revenez bientôt' : 'Check back soon'}</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => {
                const question = getLocalizedValue(faq.question, locale);
                const answer = getLocalizedValue(faq.answer, locale);
                return (
                  <AccordionItem key={faq.id} value={`faq-${i}`} className="border rounded-lg px-4 data-[state=open]:shadow-sm">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                        <span>{question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          {/* CTA */}
          <div className="mt-16 text-center bg-muted/30 rounded-2xl p-8 lg:p-12">
            <HelpCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {locale === 'ar' ? 'لم تجد إجابتك؟' : locale === 'fr' ? 'Vous n\'avez pas trouvé votre réponse ?' : 'Didn\'t find your answer?'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {locale === 'ar' ? 'تواصل معنا وسنجيب على جميع أسئلتك' : locale === 'fr' ? 'Contactez-nous et nous répondrons à toutes vos questions' : 'Get in touch and we\'ll answer all your questions'}
            </p>
            <Button size="lg" onClick={() => setCurrentPage('contact')} className="cursor-pointer">
              {t.contact.submit}
              <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180 rtl:ml-0 rtl:mr-2" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
