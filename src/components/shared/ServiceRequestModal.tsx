'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, Wrench, Plus, X, PackageSearch } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/i18n';
import { getLocalizedValue } from '@/lib/helpers';
import type { Service } from '@/lib/types';
import type { Machine } from '@/lib/types';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
}

export function ServiceRequestModal({
  isOpen,
  onClose,
  preselectedServiceId,
}: ServiceRequestModalProps) {
  const { locale } = useAppStore();
  const t = getTranslations(locale);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceId: '',
    selectedMachines: [] as string[],
    customMachines: [] as string[],
    customMachineInput: '',
    note: '',
  });

  // Fetch services and machines on mount
  useEffect(() => {
    if (!isOpen) return;

    setDataLoading(true);

    Promise.allSettled([
      fetch('/api/services?limit=50').then((r) => r.json()),
      fetch('/api/machines?status=published&limit=100').then((r) => r.json()),
    ]).then(([servicesRes, machinesRes]) => {
      if (servicesRes.status === 'fulfilled' && servicesRes.value.data) {
        setServices(servicesRes.value.data);
      }
      if (machinesRes.status === 'fulfilled' && machinesRes.value.data) {
        setMachines(machinesRes.value.data);
      }
      setDataLoading(false);
    });
  }, [isOpen]);

  // Set preselected service
  useEffect(() => {
    if (preselectedServiceId && isOpen) {
      setFormData((prev) => ({ ...prev, serviceId: preselectedServiceId }));
    }
  }, [preselectedServiceId, isOpen]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        serviceId: '',
        selectedMachines: [],
        customMachines: [],
        customMachineInput: '',
        note: '',
      });
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMachine = (machineId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedMachines: prev.selectedMachines.includes(machineId)
        ? prev.selectedMachines.filter((id) => id !== machineId)
        : [...prev.selectedMachines, machineId],
    }));
  };

  const addCustomMachine = () => {
    const trimmed = formData.customMachineInput.trim();
    if (!trimmed) return;
    // Prevent duplicates
    if (formData.customMachines.some(
      (m) => m.toLowerCase() === trimmed.toLowerCase()
    )) {
      toast.error(
        locale === 'ar'
          ? 'هذه الآلة مضافة بالفعل'
          : locale === 'fr'
            ? 'Cette machine est déjà ajoutée'
            : 'This machine is already added'
      );
      return;
    }
    setFormData((prev) => ({
      ...prev,
      customMachines: [...prev.customMachines, trimmed],
      customMachineInput: '',
    }));
  };

  const removeCustomMachine = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customMachines: prev.customMachines.filter((_, i) => i !== index),
    }));
  };

  const handleCustomMachineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomMachine();
    }
  };

  const getSelectedMachineNames = () => {
    return machines
      .filter((m) => formData.selectedMachines.includes(m.id))
      .map((m) => getLocalizedValue(m.name, locale))
      .join(', ');
  };

  const getSelectedServiceName = () => {
    const svc = services.find((s) => s.id === formData.serviceId);
    return svc ? getLocalizedValue(svc.title || svc.name, locale) : '';
  };

  const hasAnyMachines = formData.selectedMachines.length > 0 || formData.customMachines.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.serviceId) {
      toast.error(
        locale === 'ar'
          ? 'يرجى ملء الاسم والبريد الإلكتروني واختيار خدمة'
          : locale === 'fr'
            ? 'Veuillez remplir le nom, l\'email et sélectionner un service'
            : 'Please fill in your name, email, and select a service'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const machineNames = getSelectedMachineNames();
      const serviceName = getSelectedServiceName();

      // Build a comprehensive message
      const parts: string[] = [];
      if (formData.selectedMachines.length > 0) {
        parts.push(`${t.services.selectedFromList}: ${machineNames}`);
      }
      if (formData.customMachines.length > 0) {
        parts.push(`${t.services.customAdded}: ${formData.customMachines.join(', ')}`);
      }
      if (formData.note) parts.push(`${t.services.note}: ${formData.note}`);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          company: formData.company || undefined,
          subject: `${t.services.serviceRequestSubject}: ${serviceName}`,
          message: parts.length > 0 ? parts.join('\n\n') : `Service request for: ${serviceName}`,
          serviceId: formData.serviceId || undefined,
          selectedMachineIds: formData.selectedMachines.length > 0
            ? JSON.stringify(formData.selectedMachines)
            : undefined,
          customMachines: formData.customMachines.length > 0
            ? formData.customMachines.join(', ')
            : undefined,
          machineInterest: machineNames || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      toast.success(t.contact.success);
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

  const isRTL = locale === 'ar';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wrench className="h-5 w-5" />
            </div>
            {t.services.requestService}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t.contact.subtitle}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-5 p-6 pt-4">
            {/* Customer Information */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                {locale === 'ar' ? 'المعلومات الشخصية' : locale === 'fr' ? 'Informations Personnelles' : 'Customer Information'}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="svc-name">
                    {t.contact.name} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="svc-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t.contact.name}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="svc-email">
                    {t.contact.email} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="svc-email"
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="svc-phone">{t.contact.phone}</Label>
                  <Input
                    id="svc-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t.contact.phone}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="svc-company">{t.contact.company}</Label>
                  <Input
                    id="svc-company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={t.contact.company}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-1.5">
              <Label>
                {t.services.selectService} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.serviceId}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, serviceId: val }))
                }
                disabled={isSubmitting || dataLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t.services.selectServicePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {getLocalizedValue(service.title || service.name, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Machines Section Header */}
            <div className="space-y-1">
              <Label className="text-base font-semibold">{t.services.interestedMachines}</Label>
              <p className="text-xs text-muted-foreground">
                {locale === 'ar'
                  ? '(اختياري - اختر الآلات المرتبطة بطلب الخدمة)'
                  : locale === 'fr'
                    ? '(Optionnel - Sélectionnez les machines liées à la demande de service)'
                    : '(Optional — select machines related to this service request)'}
              </p>
            </div>

            {/* Machines from website catalog */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t.services.selectedFromList}
              </p>
              {dataLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.common.loading}
                </div>
              ) : machines.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  {locale === 'ar' ? 'لا توجد آلات متاحة' : locale === 'fr' ? 'Aucune machine disponible' : 'No machines available'}
                </p>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-3 max-h-44 overflow-y-auto">
                  <div className="space-y-1">
                    {machines.map((machine) => {
                      const machineName = getLocalizedValue(machine.name, locale);
                      const isSelected = formData.selectedMachines.includes(machine.id);
                      return (
                        <label
                          key={machine.id}
                          className={`flex items-center gap-3 rounded-md px-3 py-1.5 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/5 border border-primary/20'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleMachine(machine.id)}
                            disabled={isSubmitting}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{machineName}</p>
                            {machine.category && (
                              <p className="text-[11px] text-muted-foreground">
                                {getLocalizedValue(machine.category.name, locale)}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Check className={`h-4 w-4 text-primary shrink-0 ${isRTL ? 'ml-auto' : ''}`} />
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {formData.selectedMachines.length > 0 && (
                    <div className="mt-2 pt-2 border-t flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {formData.selectedMachines.length} {locale === 'ar' ? 'آلة محددة' : locale === 'fr' ? 'machine(s) sélectionnée(s)' : 'machine(s) selected'}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Machines (not listed on website) */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t.services.customAdded}
              </p>
              <div className="rounded-lg border border-dashed bg-muted/20 p-3 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <PackageSearch className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.services.customMachinesHint}</span>
                </div>

                {/* Input to add custom machine */}
                <div className="flex gap-2">
                  <Input
                    value={formData.customMachineInput}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customMachineInput: e.target.value }))
                    }
                    onKeyDown={handleCustomMachineKeyDown}
                    placeholder={t.services.customMachinesPlaceholder}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomMachine}
                    disabled={isSubmitting || !formData.customMachineInput.trim()}
                    className="shrink-0 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 rtl:mr-0 rtl:ml-1 rtl:rotate-180 mr-1" />
                    {t.services.addMachine}
                  </Button>
                </div>

                {/* List of added custom machines */}
                {formData.customMachines.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.customMachines.map((machine, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="flex items-center gap-1 py-1 px-2.5 text-xs"
                      >
                        <span>{machine}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomMachine(i)}
                          disabled={isSubmitting}
                          className="hover:text-destructive transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary when machines are selected */}
            {hasAnyMachines && (
              <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
                <p className="text-xs font-medium text-primary mb-1">
                  {locale === 'ar' ? 'ملخص الآلات' : locale === 'fr' ? 'Résumé des machines' : 'Machine Summary'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formData.selectedMachines.length > 0 && (
                    <span>
                      {formData.selectedMachines.length} {locale === 'ar' ? 'من الكتالوج' : locale === 'fr' ? 'du catalogue' : 'from catalog'}
                      {formData.customMachines.length > 0 && ' + '}
                    </span>
                  )}
                  {formData.customMachines.length > 0 && (
                    <span>
                      {formData.customMachines.length} {locale === 'ar' ? 'مخصصة' : locale === 'fr' ? 'personnalisée(s)' : 'custom'}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Note */}
            <div className="space-y-1.5">
              <Label htmlFor="svc-note">{t.services.note}</Label>
              <Textarea
                id="svc-note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={3}
                placeholder={t.services.notePlaceholder}
                disabled={isSubmitting}
              />
            </div>

            {/* Actions */}
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
                  t.services.requestService
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
