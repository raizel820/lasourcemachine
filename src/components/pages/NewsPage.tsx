'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/i18n';
import { getLocalizedValue, truncateText, formatDate } from '@/lib/helpers';
import type { NewsPost } from '@/lib/types';

export function NewsPage() {
  const { locale, setCurrentPage, setCurrentSlug } = useAppStore();
  const t = getTranslations(locale);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/api/news?limit=100&status=published');
        if (res.ok) {
          const data = await res.json();
          setNews(data.data || data.news || []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleReadMore = (post: NewsPost) => {
    setCurrentSlug(post.slug);
    setCurrentPage('news-detail');
  };

  return (
    <>
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">{t.news.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t.news.subtitle}</p>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((post) => (
                <Card key={post.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleReadMore(post)}>
                  <div className="relative overflow-hidden rounded-t-xl">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={getLocalizedValue(post.title, locale)} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Newspaper className="h-10 w-10 text-primary/30" />
                      </div>
                    )}
                    {post.isFeatured && (
                      <Badge className="absolute top-3 start-3 bg-primary text-primary-foreground">{t.common.featured}</Badge>
                    )}
                  </div>
                  <CardContent className="pt-4 px-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.publishedAt, locale)}
                        </span>
                      )}
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-base leading-tight mb-2 group-hover:text-primary transition-colors">
                      {getLocalizedValue(post.title, locale)}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {truncateText(getLocalizedValue(post.excerpt, locale), 120)}
                      </p>
                    )}
                    <span className="text-sm font-medium text-primary group-hover:underline">
                      {t.news.readMore} →
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => { setCurrentSlug(`news-${i + 1}`); setCurrentPage('news-detail'); }}>
                  <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Newspaper className="h-10 w-10 text-primary/30" />
                  </div>
                  <CardContent className="pt-4 px-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(new Date(), locale)}
                    </div>
                    <h3 className="font-semibold text-base leading-tight mb-2">
                      {locale === 'ar' ? `خبر ${i + 1}` : locale === 'fr' ? `Nouvelle ${i + 1}` : `News ${i + 1}`}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {locale === 'ar' ? 'اقرأ آخر التطورات في عالم الآلات الصناعية' : locale === 'fr' ? 'Découvrez les dernières actualités de l\'industrie' : 'Read the latest industry developments'}
                    </p>
                    <span className="text-sm font-medium text-primary">{t.news.readMore} →</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
