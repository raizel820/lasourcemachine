'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, GripVertical, ArrowUp, ArrowDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageGalleryUpload } from '@/components/ui/image-gallery-upload';
import { getLocalizedValue, generateSlug } from '@/lib/helpers';

const ADMIN_HEADERS = { Authorization: 'Bearer admin-token' };

// Machine item for the selector
interface MachineItem {
  id: string;
  name: string;
  slug: string;
}

// Machine association stored in form
interface MachineAssociation {
  machineId: string;
  order: number;
}

// Junction table entry from API
interface MachineProductionLine {
  id: string;
  machineId: string;
  productionLineId: string;
  order: number;
  machine?: MachineItem;
}

// Production line from API
interface ProductionLine {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  images: string;
  coverImage: string | null;
  specs: string | null;
  basePrice: number | null;
  currency: string;
  featured: boolean;
  status: string;
  order: number;
  machines?: MachineProductionLine[];
}

interface SpecRow {
  key: string;
  value: string;
}

interface FormData {
  name_en: string;
  name_fr: string;
  name_ar: string;
  description_en: string;
  description_fr: string;
  description_ar: string;
  shortDesc_en: string;
  shortDesc_fr: string;
  shortDesc_ar: string;
  slug: string;
  images: string[];
  coverImage: string;
  status: string;
  featured: boolean;
  order: number;
  machines: MachineAssociation[];
  basePrice: string;
  currency: string;
  specs_en: SpecRow[];
  specs_fr: SpecRow[];
  specs_ar: SpecRow[];
}

const emptyForm: FormData = {
  name_en: '',
  name_fr: '',
  name_ar: '',
  description_en: '',
  description_fr: '',
  description_ar: '',
  shortDesc_en: '',
  shortDesc_fr: '',
  shortDesc_ar: '',
  slug: '',
  images: [],
  coverImage: '',
  status: 'draft',
  featured: false,
  order: 0,
  machines: [],
  basePrice: '',
  currency: 'DZD',
  specs_en: [],
  specs_fr: [],
  specs_ar: [],
};

function parseJsonField(value: string | null): Record<string, string> {
  try {
    const parsed = JSON.parse(value || '{}');
    if (typeof parsed === 'object' && parsed !== null) return parsed;
    return { en: String(value || ''), fr: String(value || ''), ar: String(value || '') };
  } catch {
    return { en: String(value || ''), fr: String(value || ''), ar: String(value || '') };
  }
}

function buildJsonField(obj: Record<string, string>): string {
  return JSON.stringify(obj);
}

function parseSpecsField(value: string | null): Record<string, SpecRow[]> {
  try {
    const parsed = JSON.parse(value || '{}');
    if (typeof parsed === 'object' && parsed !== null) {
      const result: Record<string, SpecRow[]> = {
        en: Array.isArray(parsed.en) ? parsed.en.map((s: Record<string, string>) => ({ key: s.key || '', value: s.value || '' })) : [],
        fr: Array.isArray(parsed.fr) ? parsed.fr.map((s: Record<string, string>) => ({ key: s.key || '', value: s.value || '' })) : [],
        ar: Array.isArray(parsed.ar) ? parsed.ar.map((s: Record<string, string>) => ({ key: s.key || '', value: s.value || '' })) : [],
      };
      return result;
    }
    return { en: [], fr: [], ar: [] };
  } catch {
    return { en: [], fr: [], ar: [] };
  }
}

export function AdminProductionLinesPage() {
  const [items, setItems] = useState<ProductionLine[]>([]);
  const [allMachines, setAllMachines] = useState<MachineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ProductionLine | null>(null);
  const [deleteItem, setDeleteItem] = useState<ProductionLine | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState('');
  const [machineSearch, setMachineSearch] = useState('');

  const fetchData = async () => {
    try {
      const [linesRes, machinesRes] = await Promise.all([
        fetch('/api/production-lines?limit=100&status=all', { headers: ADMIN_HEADERS }),
        fetch('/api/machines?limit=100&status=all', { headers: ADMIN_HEADERS }),
      ]);
      if (linesRes.ok) {
        const data = await linesRes.json();
        setItems(data.data || []);
      }
      if (machinesRes.ok) {
        const data = await machinesRes.json();
        setAllMachines((data.data || []).map((m: MachineItem) => ({ id: m.id, name: m.name, slug: m.slug })));
      }
    } catch {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...emptyForm, specs_en: [{ key: '', value: '' }], specs_fr: [{ key: '', value: '' }], specs_ar: [{ key: '', value: '' }] });
    setMachineSearch('');
    setShowForm(true);
  };

  const openEdit = async (item: ProductionLine) => {
    setMachineSearch('');
    // Fetch the full production line with machine associations from the slug endpoint
    try {
      const res = await fetch(`/api/production-lines/${item.slug}`, { headers: ADMIN_HEADERS });
      if (res.ok) {
        const data = await res.json();
        const fullItem = data.data as ProductionLine;
        const name = parseJsonField(fullItem.name);
        const description = parseJsonField(fullItem.description);
        const shortDesc = parseJsonField(fullItem.shortDesc);
        const specs = parseSpecsField(fullItem.specs);

        // Build machines array from junction table
        const machines: MachineAssociation[] = (fullItem.machines || []).map(mpl => ({
          machineId: mpl.machineId,
          order: mpl.order,
        }));

        setEditItem(fullItem);
        setForm({
          name_en: name.en || '',
          name_fr: name.fr || '',
          name_ar: name.ar || '',
          description_en: description.en || '',
          description_fr: description.fr || '',
          description_ar: description.ar || '',
          shortDesc_en: shortDesc.en || '',
          shortDesc_fr: shortDesc.fr || '',
          shortDesc_ar: shortDesc.ar || '',
          slug: fullItem.slug,
          images: (() => {
            try { return JSON.parse(fullItem.images || '[]'); } catch { return []; }
          })(),
          coverImage: fullItem.coverImage || '',
          status: fullItem.status,
          featured: fullItem.featured,
          order: fullItem.order,
          machines: machines.sort((a, b) => a.order - b.order),
          basePrice: fullItem.basePrice != null ? String(fullItem.basePrice) : '',
          currency: fullItem.currency || 'DZD',
          specs_en: specs.en.length > 0 ? specs.en : [{ key: '', value: '' }],
          specs_fr: specs.fr.length > 0 ? specs.fr : [{ key: '', value: '' }],
          specs_ar: specs.ar.length > 0 ? specs.ar : [{ key: '', value: '' }],
        });
        setShowForm(true);
      } else {
        toast.error('Failed to load production line details');
      }
    } catch {
      toast.error('Failed to load production line details');
    }
  };

  const handleSubmit = async () => {
    if (!form.name_en) {
      toast.error('English name is required');
      return;
    }
    setSaving(true);
    try {
      const slug = editItem
        ? (form.slug || generateSlug(form.name_en))
        : generateSlug(form.name_en);

      // Build specs JSON
      const specsObj: Record<string, SpecRow[]> = {
        en: form.specs_en.filter(s => s.key.trim()),
        fr: form.specs_fr.filter(s => s.key.trim()),
        ar: form.specs_ar.filter(s => s.key.trim()),
      };

      const body = {
        name: buildJsonField({ en: form.name_en, fr: form.name_fr, ar: form.name_ar }),
        slug,
        description: buildJsonField({ en: form.description_en, fr: form.description_fr, ar: form.description_ar }),
        shortDesc: buildJsonField({ en: form.shortDesc_en, fr: form.shortDesc_fr, ar: form.shortDesc_ar }),
        images: JSON.stringify(form.images),
        coverImage: form.coverImage || null,
        specs: JSON.stringify(specsObj),
        basePrice: form.basePrice ? parseFloat(form.basePrice) : null,
        currency: form.currency || 'DZD',
        status: form.status,
        featured: form.featured,
        order: form.order,
        // Send machine associations with order
        machines: form.machines.map((m, idx) => ({
          machineId: m.machineId,
          order: idx,
        })),
      };

      const url = editItem
        ? `/api/production-lines/${editItem.slug}`
        : '/api/production-lines';
      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editItem ? 'Production line updated' : 'Production line created');
        setShowForm(false);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Operation failed');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await fetch(`/api/production-lines/${deleteItem.slug}`, {
        method: 'DELETE',
        headers: ADMIN_HEADERS,
      });
      if (res.ok) {
        toast.success('Production line deleted');
        setDeleteItem(null);
        fetchData();
      } else {
        toast.error('Delete failed');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const updateForm = (key: keyof FormData, value: string | boolean | number | string[] | SpecRow[] | MachineAssociation[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Machine management functions
  const selectedMachineIds = new Set(form.machines.map(m => m.machineId));
  const unselectedMachines = allMachines.filter(m => !selectedMachineIds.has(m.id));
  const filteredUnselected = machineSearch.trim()
    ? unselectedMachines.filter(m => {
        const q = machineSearch.toLowerCase();
        return getLocalizedValue(m.name, 'fr').toLowerCase().includes(q) ||
               getLocalizedValue(m.name, 'en').toLowerCase().includes(q) ||
               m.slug.toLowerCase().includes(q);
      })
    : unselectedMachines;

  const addMachine = (machineId: string) => {
    setForm((prev) => ({
      ...prev,
      machines: [...prev.machines, { machineId, order: prev.machines.length }],
    }));
  };

  const removeMachine = (machineId: string) => {
    setForm((prev) => ({
      ...prev,
      machines: prev.machines
        .filter(m => m.machineId !== machineId)
        .map((m, idx) => ({ ...m, order: idx })),
    }));
  };

  const moveMachine = (index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const arr = [...prev.machines];
      const swapIdx = direction === 'up' ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return prev;
      [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
      return { ...prev, machines: arr.map((m, i) => ({ ...m, order: i })) };
    });
  };

  const addSpecRow = (locale: 'en' | 'fr' | 'ar') => {
    const key = `specs_${locale}` as keyof FormData;
    setForm((prev) => ({
      ...prev,
      [key]: [...(prev[key] as SpecRow[]), { key: '', value: '' }],
    }));
  };

  const updateSpecRow = (locale: 'en' | 'fr' | 'ar', index: number, field: 'key' | 'value', val: string) => {
    const key = `specs_${locale}` as keyof FormData;
    setForm((prev) => {
      const rows = [...(prev[key] as SpecRow[])];
      rows[index] = { ...rows[index], [field]: val };
      return { ...prev, [key]: rows };
    });
  };

  const removeSpecRow = (locale: 'en' | 'fr' | 'ar', index: number) => {
    const key = `specs_${locale}` as keyof FormData;
    setForm((prev) => {
      const rows = (prev[key] as SpecRow[]).filter((_, i) => i !== index);
      return { ...prev, [key]: rows.length > 0 ? rows : [{ key: '', value: '' }] };
    });
  };

  const getMachineName = (machineId: string): string => {
    const m = allMachines.find(m => m.id === machineId);
    return m ? getLocalizedValue(m.name, 'fr') : machineId;
  };

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const nameEn = getLocalizedValue(item.name, 'en').toLowerCase();
    const nameFr = getLocalizedValue(item.name, 'fr').toLowerCase();
    const nameAr = getLocalizedValue(item.name, 'ar').toLowerCase();
    return nameEn.includes(q) || nameFr.includes(q) || nameAr.includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Production Lines</h1>
          <p className="text-muted-foreground">Manage your production lines</p>
        </div>
        <Button onClick={openCreate} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Production Line
        </Button>
      </div>

      <Input
        placeholder="Search production lines..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Machines</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No production lines found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {getLocalizedValue(item.name, 'fr')}
                      </TableCell>
                      <TableCell>
                        {item.basePrice
                          ? `${Number(item.basePrice).toLocaleString()} ${item.currency || 'DZD'}`
                          : <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.machines?.length || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.featured && <Badge variant="outline">Featured</Badge>}
                          {!item.featured && <span className="text-muted-foreground">-</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(item)} className="cursor-pointer">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteItem(item)} className="cursor-pointer text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      {/* Create/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Production Line' : 'Add Production Line'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="space-y-5 pb-4">

              {/* Name */}
              <div className="space-y-2">
                <Label>Name</Label>
                <Tabs defaultValue="fr">
                  <TabsList className="mb-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                    <TabsTrigger value="ar">AR</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr"><Input value={form.name_fr} onChange={(e) => updateForm('name_fr', e.target.value)} placeholder="Nom en français" /></TabsContent>
                  <TabsContent value="en"><Input value={form.name_en} onChange={(e) => updateForm('name_en', e.target.value)} placeholder="Name in English" /></TabsContent>
                  <TabsContent value="ar"><Input value={form.name_ar} onChange={(e) => updateForm('name_ar', e.target.value)} placeholder="الاسم بالعربية" dir="rtl" /></TabsContent>
                </Tabs>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Tabs defaultValue="fr">
                  <TabsList className="mb-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                    <TabsTrigger value="ar">AR</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr"><Textarea value={form.description_fr} onChange={(e) => updateForm('description_fr', e.target.value)} placeholder="Description en français" rows={4} /></TabsContent>
                  <TabsContent value="en"><Textarea value={form.description_en} onChange={(e) => updateForm('description_en', e.target.value)} placeholder="Description in English" rows={4} /></TabsContent>
                  <TabsContent value="ar"><Textarea value={form.description_ar} onChange={(e) => updateForm('description_ar', e.target.value)} placeholder="الوصف بالعربية" rows={4} dir="rtl" /></TabsContent>
                </Tabs>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Tabs defaultValue="fr">
                  <TabsList className="mb-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                    <TabsTrigger value="ar">AR</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr"><Textarea value={form.shortDesc_fr} onChange={(e) => updateForm('shortDesc_fr', e.target.value)} placeholder="Courte description" rows={2} /></TabsContent>
                  <TabsContent value="en"><Textarea value={form.shortDesc_en} onChange={(e) => updateForm('shortDesc_en', e.target.value)} placeholder="Short description" rows={2} /></TabsContent>
                  <TabsContent value="ar"><Textarea value={form.shortDesc_ar} onChange={(e) => updateForm('shortDesc_ar', e.target.value)} placeholder="وصف قصير" rows={2} dir="rtl" /></TabsContent>
                </Tabs>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="production-line-slug" />
              </div>

              {/* Images */}
              <ImageGalleryUpload
                images={form.images}
                onChange={(urls) => updateForm('images', urls)}
                label="Gallery Images (line photos, assembled views)"
                folder="production-lines"
              />

              <ImageUpload
                value={form.coverImage}
                onChange={(url) => updateForm('coverImage', url)}
                label="Cover Image (assembled line photo)"
                placeholder="Upload or paste cover image URL"
                folder="production-lines"
                previewClassName="h-32 w-full"
              />

              {/* Price */}
              <div className="space-y-2">
                <Label>Price</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.basePrice}
                    onChange={(e) => updateForm('basePrice', e.target.value)}
                    placeholder="0.00"
                  />
                  <Select value={form.currency} onValueChange={(v) => updateForm('currency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DZD">DZD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Production Line Specifications */}
              <div className="space-y-2">
                <Label>Production Line Specifications</Label>
                <Tabs defaultValue="fr">
                  <TabsList className="mb-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                    <TabsTrigger value="ar">AR</TabsTrigger>
                  </TabsList>
                  {(['fr', 'en', 'ar'] as const).map((loc) => (
                    <TabsContent key={loc} value={loc}>
                      <div className="space-y-2">
                        {(form[`specs_${loc}`] as SpecRow[]).map((row, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Input
                              placeholder="Key"
                              value={row.key}
                              onChange={(e) => updateSpecRow(loc, idx, 'key', e.target.value)}
                              className="flex-1"
                              dir={loc === 'ar' ? 'rtl' : 'ltr'}
                            />
                            <Input
                              placeholder="Value"
                              value={row.value}
                              onChange={(e) => updateSpecRow(loc, idx, 'value', e.target.value)}
                              className="flex-1"
                              dir={loc === 'ar' ? 'rtl' : 'ltr'}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="cursor-pointer text-destructive hover:text-destructive flex-shrink-0"
                              onClick={() => removeSpecRow(loc, idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer w-full"
                          onClick={() => addSpecRow(loc)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Row
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <Separator />

              {/* Machine Selection with Ordering */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Included Machines (in order)</Label>
                  <Badge variant="secondary">{form.machines.length} machine{form.machines.length !== 1 ? 's' : ''}</Badge>
                </div>

                {/* Selected machines list with ordering */}
                {form.machines.length > 0 && (
                  <div className="border rounded-md divide-y">
                    {form.machines.map((m, idx) => (
                      <div key={m.machineId} className="flex items-center gap-2 px-3 py-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-mono text-muted-foreground w-6 text-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm flex-1 truncate">
                          {getMachineName(m.machineId)}
                        </span>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 cursor-pointer"
                            disabled={idx === 0}
                            onClick={() => moveMachine(idx, 'up')}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 cursor-pointer"
                            disabled={idx === form.machines.length - 1}
                            onClick={() => moveMachine(idx, 'down')}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => removeMachine(m.machineId)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Machine selector dropdown */}
                <div className="space-y-2">
                  <Input
                    placeholder="Search machines to add..."
                    value={machineSearch}
                    onChange={(e) => setMachineSearch(e.target.value)}
                    className="text-sm"
                  />
                  {filteredUnselected.length > 0 ? (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {filteredUnselected.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => addMachine(m.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition cursor-pointer"
                        >
                          <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{getLocalizedValue(m.name, 'fr')}</span>
                          <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{m.slug}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground px-1">
                      {machineSearch.trim()
                        ? 'No matching machines found'
                        : 'All machines have been added to this production line'}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Status Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={form.featured} onCheckedChange={(v) => updateForm('featured', v)} />
                  <Label>Featured</Label>
                </div>
                <div className="space-y-0">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => updateForm('status', v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-0">
                  <Label>Order</Label>
                  <Input type="number" value={String(form.order)} onChange={(e) => updateForm('order', parseInt(e.target.value) || 0)} />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowForm(false)} className="cursor-pointer">Cancel</Button>
                <Button onClick={handleSubmit} disabled={saving} className="cursor-pointer">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Production Line</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteItem ? getLocalizedValue(deleteItem.name, 'fr') : ''}&quot;?
              This will also remove all machine associations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="cursor-pointer bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
