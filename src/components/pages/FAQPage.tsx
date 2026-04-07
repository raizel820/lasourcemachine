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

const DEFAULT_FAQS = [
  { question: { en: 'What types of machines do you sell?', fr: 'Quels types de machines vendez-vous ?', ar: 'ما أنواع الآلات التي تبيعونها؟' }, answer: { en: 'We offer a wide range of industrial machines including CNC machines, lathes, milling machines, presses, welding equipment, cutting machines, and more. We also provide complete production lines for various industries.', fr: 'Nous proposons une large gamme de machines industrielles incluant des machines CNC, des tours, des fraiseuses, des presses, des équipements de soudure, des machines de découpe, et bien plus. Nous fournissons également des lignes de production complètes pour diverses industries.', ar: 'نقدم مجموعة واسعة من الآلات الصناعية بما في ذلك آلات CNC، أخراط، آلات طحن، مكابس، معدات لحام، آلات قص، والمزيد. كما نوفر خطوط إنتاج كاملة لمختلف الصناعات.' } },
  { question: { en: 'Do you provide installation services?', fr: 'Proposez-vous des services d\'installation ?', ar: 'هل تقدمون خدمات التركيب؟' }, answer: { en: 'Yes, we provide professional installation and commissioning services for all our machines and production lines. Our team of experienced technicians will ensure everything is set up correctly and running smoothly.', fr: 'Oui, nous proposons des services d\'installation et de mise en service professionnels pour toutes nos machines et lignes de production. Notre équipe de techniciens expérimentés veillera à ce que tout soit installé correctement et fonctionne de manière optimale.', ar: 'نعم، نقدم خدمات تركيب وتشغيل احترافية لجميع آلاتنا وخطوط الإنتاج. فريقنا من الفنيين ذوي الخبرة يضمن التركيب الصحيح والتشغيل السلس.' } },
  { question: { en: 'What warranty do you offer?', fr: 'Quelle garantie proposez-vous ?', ar: 'ما هي الضمانة التي تقدمونها؟' }, answer: { en: 'All our machines come with a manufacturer warranty. The warranty period varies by machine type and manufacturer, typically ranging from 1 to 3 years. Extended warranty options are also available.', fr: 'Toutes nos machines sont livrées avec une garantie constructeur. La période de garantie varie selon le type de machine et le fabricant, généralement entre 1 et 3 ans. Des options de garantie étendue sont également disponibles.', ar: 'جميع آلاتنا تأتي مع ضمان من الشركة المصنعة. تختلف فترة الضمان حسب نوع الآلة والشركة المصنعة، وتتراوح عادة بين 1 و 3 سنوات. تتوفر أيضا خيارات ضمان موسعة.' } },
  { question: { en: 'Do you ship across Algeria?', fr: 'Livrez-vous dans toute l\'Algérie ?', ar: 'هل تتوصلون في جميع أنحاء الجزائر؟' }, answer: { en: 'Yes, we deliver to all wilayas across Algeria. We have established logistics partnerships to ensure safe and timely delivery of your machines and equipment.', fr: 'Oui, nous livrons dans toutes les wilayas d\'Algérie. Nous avons établi des partenariats logistiques pour garantir une livraison sûre et rapide de vos machines et équipements.', ar: 'نعم، نتوصل في جميع الولايات عبر الجزائر. لقد أقمنا شراكات لوجستية لضمان التوصيل الآمن وفي الوقت المناسب لآلاتك ومعداتك.' } },
  { question: { en: 'How can I request a quote?', fr: 'Comment demander un devis ?', ar: 'كيف يمكنني طلب عرض سعر؟' }, answer: { en: 'You can request a quote through our website by visiting the machines section and clicking "Request a Quote", by calling us directly, by sending an email, or by using WhatsApp. Our team will respond within 24 hours with a detailed quotation.', fr: 'Vous pouvez demander un devis via notre site web en visitant la section machines et en cliquant sur "Demander un Devis", en nous appelant directement, en envoyant un email, ou en utilisant WhatsApp. Notre équipe répondra sous 24 heures avec un devis détaillé.', ar: 'يمكنك طلب عرض سعر من خلال موقعنا بزيارة قسم الآلات والنقر على "طلب عرض سعر"، أو بالاتصال بنا مباشرة، أو إرسال بريد إلكتروني، أو استخدام واتساب. سيرد فريقنا خلال 24 ساعة بعرض أسعار مفصل.' } },
  { question: { en: 'Do you offer training for operators?', fr: 'Proposez-vous des formations pour les opérateurs ?', ar: 'هل تقدمون تدريبا للمشغلين؟' }, answer: { en: 'Yes, we offer comprehensive training programs for machine operators and maintenance technicians. Training can be conducted at our facility or on-site at your location.', fr: 'Oui, nous proposons des programmes de formation complets pour les opérateurs de machines et les techniciens de maintenance. La formation peut être dispensée dans notre installation ou sur site chez vous.', ar: 'نعم، نقدم برامج تدريب شاملة لمشغلي الآلات وفنيي الصيانة. يمكن إجراء التدريب في منشأتنا أو في موقعكم.' } },
];

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

  const displayFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;

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
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {displayFaqs.map((faq, i) => {
                const isFromApi = 'id' in faq && 'question' in faq && typeof faq.question === 'string';
                const question = isFromApi ? getLocalizedValue((faq as FAQ).question, locale) : faq.question[locale] || faq.question.en;
                const answer = isFromApi ? getLocalizedValue((faq as FAQ).answer, locale) : faq.answer[locale] || faq.answer.en;
                return (
                  <AccordionItem key={isFromApi ? (faq as FAQ).id : i} value={`faq-${i}`} className="border rounded-lg px-4 data-[state=open]:shadow-sm">
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
