'use client';

import { Factory, Users, Globe, Target, Eye, Heart, Shield, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/i18n';

export function AboutPage() {
  const { locale, setCurrentPage } = useAppStore();
  const t = getTranslations(locale);

  const values = [
    { icon: Shield, title: locale === 'ar' ? 'الجودة' : locale === 'fr' ? 'Qualité' : 'Quality', desc: locale === 'ar' ? 'نلتزم بأعلى معايير الجودة في جميع منتجاتنا وخدماتنا' : locale === 'fr' ? 'Nous nous engageons aux plus hauts standards de qualité dans tous nos produits et services' : 'We are committed to the highest quality standards in all our products and services' },
    { icon: Heart, title: locale === 'ar' ? 'خدمة العملاء' : locale === 'fr' ? 'Service Client' : 'Customer Service', desc: locale === 'ar' ? 'رضا عملائنا هو أولويتنا الأولى ونسعى لتقديم أفضل تجربة' : locale === 'fr' ? 'La satisfaction de nos clients est notre priorité absolue' : 'Customer satisfaction is our absolute priority' },
    { icon: Award, title: locale === 'ar' ? 'الابتكار' : locale === 'fr' ? 'Innovation' : 'Innovation', desc: locale === 'ar' ? 'نسعى دائما لتبني أحدث التقنيات والحلول المبتكرة' : locale === 'fr' ? 'Nous recherchons toujours les dernières technologies et solutions innovantes' : 'We constantly seek the latest technologies and innovative solutions' },
    { icon: Globe, title: locale === 'ar' ? 'الشراكة' : locale === 'fr' ? 'Partenariat' : 'Partnership', desc: locale === 'ar' ? 'نبني علاقات شراكة طويلة الأمد مع عملائنا وموردينا' : locale === 'fr' ? 'Nous construisons des relations de partenariat à long terme' : 'We build long-term partnership relationships with our clients and suppliers' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="mx-auto max-w-3xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-white mx-auto mb-6">
              <Factory className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{t.about.title}</h1>
            <p className="mt-6 text-lg text-blue-100">{t.about.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t.about.ourStory}</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {locale === 'ar'
                    ? 'تأسست شركة LA SOURCE MACHIEN في الجزائر قبل أكثر من 15 عاماً لتصبح اليوم واحدة من الشركات الرائدة في مجال توريد الآلات الصناعية وخطوط الإنتاج في شمال أفريقيا.'
                    : locale === 'fr'
                      ? 'Fondée en Algérie il y a plus de 15 ans, LA SOURCE MACHIEN est aujourd\'hui l\'un des leaders de la fourniture de machines industrielles et de lignes de production en Afrique du Nord.'
                      : 'Founded in Algeria over 15 years ago, LA SOURCE MACHIEN is today one of the leading suppliers of industrial machinery and production lines in North Africa.'}
                </p>
                <p>
                  {locale === 'ar'
                    ? 'منذ تأسيسها، ركزت الشركة على توفير حلول صناعية متكاملة تلبي احتياجات القطاعات المختلفة، من البناء والتشييد إلى الصناعات الغذائية والتصنيع.'
                    : locale === 'fr'
                      ? 'Depuis sa création, l\'entreprise s\'est concentrée sur la fourniture de solutions industrielles complètes répondant aux besoins de divers secteurs, de la construction aux industries alimentaires et de fabrication.'
                      : 'Since its inception, the company has focused on providing complete industrial solutions that meet the needs of various sectors, from construction to food and manufacturing industries.'}
                </p>
                <p>
                  {locale === 'ar'
                    ? 'نحن نعمل مع أفضل العلامات التجارية العالمية لضمان حصول عملائنا على معدات عالية الجودة بأسعار تنافسية.'
                    : locale === 'fr'
                      ? 'Nous travaillons avec les meilleures marques mondiales pour garantir que nos clients reçoivent un équipement de haute qualité à des prix compétitifs.'
                      : 'We work with the best global brands to ensure our customers receive high-quality equipment at competitive prices.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Factory, value: '15+', label: t.stats.yearsExperience },
                { icon: Target, value: '500+', label: t.stats.machinesSold },
                { icon: Users, value: '200+', label: t.stats.clients },
                { icon: Globe, value: '10+', label: t.stats.countries },
              ].map((stat, i) => (
                <Card key={i} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 px-4">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="overflow-hidden border-primary/20">
              <div className="bg-primary/5 p-6">
                <Target className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-xl font-bold">{t.about.mission}</h3>
              </div>
              <CardContent className="pt-4">
                <p className="text-muted-foreground leading-relaxed">
                  {locale === 'ar'
                    ? 'مهمتنا هي تزويد الصناعات الجزائرية والعربية بأفضل الآلات والمعدات الصناعية، مع تقديم خدمات ما بعد البيع المتميزة التي تضمن الأداء الأمثل والإنتاجية العالية.'
                    : locale === 'fr'
                      ? 'Notre mission est d\'équiper les industries algériennes et arabes des meilleures machines et équipements industriels, tout en offrant un service après-vente exceptionnel garantissant des performances optimales et une haute productivité.'
                      : 'Our mission is to equip Algerian and Arab industries with the best industrial machinery and equipment, while providing exceptional after-sales service that ensures optimal performance and high productivity.'}
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-primary/20">
              <div className="bg-primary/5 p-6">
                <Eye className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-xl font-bold">{t.about.vision}</h3>
              </div>
              <CardContent className="pt-4">
                <p className="text-muted-foreground leading-relaxed">
                  {locale === 'ar'
                    ? 'رؤيتنا أن نكون الشريك الصناعي الأول في شمال أفريقيا، معرووفين بالتميز والابتكار والموثوقية في كل ما نقدمه.'
                    : locale === 'fr'
                      ? 'Notre vision est d\'être le partenaire industriel de référence en Afrique du Nord, reconnu pour l\'excellence, l\'innovation et la fiabilité dans tout ce que nous faisons.'
                      : 'Our vision is to be the premier industrial partner in North Africa, known for excellence, innovation, and reliability in everything we do.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            {locale === 'ar' ? 'قيمنا' : locale === 'fr' ? 'Nos Valeurs' : 'Our Values'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <Card key={i} className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="pt-6 px-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                    <v.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t.cta.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">{t.cta.subtitle}</p>
          <div className="mt-8">
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
