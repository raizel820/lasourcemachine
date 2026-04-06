'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/i18n';

interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineId?: string;
}

export function RequestQuoteModal({
  isOpen,
  onClose,
  machineName,
  machineId,
}: RequestQuoteModalProps) {
  const { locale } = useAppStore();
  const t = getTranslations(locale);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error(locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : locale === 'fr' ? 'Veuillez remplir tous les champs requis' : 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subject: machineName
            ? `Quote Request: ${machineName}`
            : 'General Quote Request',
          machineId: machineId || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      toast.success(t.contact.success);
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      onClose();
    } catch {
      toast.error(t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            {t.machines.requestQuote}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t.contact.subtitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {machineName && (
            <div className="rounded-lg bg-muted/50 border p-3">
              <p className="text-sm text-muted-foreground">
                {locale === 'ar' ? 'الآلة' : locale === 'fr' ? 'Machine' : 'Machine'}
              </p>
              <p className="font-medium">{machineName}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quote-name">
                {t.contact.name} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quote-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t.contact.name}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-email">
                {t.contact.email} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quote-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t.contact.email}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quote-phone">{t.contact.phone}</Label>
              <Input
                id="quote-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t.contact.phone}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-company">{t.contact.company}</Label>
              <Input
                id="quote-company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder={t.contact.company}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-message">
              {t.contact.message} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="quote-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder={t.contact.message}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 cursor-pointer"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                t.machines.requestQuote
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
