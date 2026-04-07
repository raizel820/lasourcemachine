'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
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
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageGalleryUpload } from '@/components/ui/image-gallery-upload';
import { getLocalizedValue } from '@/lib/helpers';
import { generateSlug } from '@/lib/helpers';

const ADMIN_HEADERS = { Authorization: 'Bearer admin-token' };

interface ProductionLine {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  images: string;
  coverImage: string | null;
  featured: boolean;
  status: string;
  order: number;
}

interface MachineItem {
  id: string;
  name: string;
  slug: string;
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
  machineIds: string[];
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
  machineIds: [],
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

export function AdminProductionLinesPage() {
  const [items, setItems] = useState<ProductionLine[]>([]);
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ProductionLine | null>(null);
  const [deleteItem, setDeleteItem] = useState<ProductionLine | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [linesRes, machinesRes] = await Promise.all([
        fetch('/api/production-lines?limit=100&status=all', { headers: ADMIN_HEADERS }),
        fetch('/api/machines?limit=100', { headers: ADMIN_HEADERS }),
      ]);
      if (linesRes.ok) {
        const data = await linesRes.json();
        setItems(data.data || []);
      }
      if (machinesRes.ok) {
        const data = await machinesRes.json();
        setMachines((data.data || []).map((m: MachineItem) => ({ id: m.id, name: m.name, slug: m.slug })));
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
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: ProductionLine) => {
    const name = parseJsonField(item.name);
    const description = parseJsonField(item.description);
    const shortDesc = parseJsonField(item.shortDesc);
    setEditItem(item);
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
      slug: item.slug,
      images: (() => {
        try { return JSON.parse(item.images || '[]'); } catch { return []; }
      })(),
      coverImage: item.coverImage || '',
      status: item.status,
      featured: item.featured,
      order: item.order,
      machineIds: [],
    });
    setShowForm(true);
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

      const body = {
        name: buildJsonField({ en: form.name_en, fr: form.name_fr, ar: form.name_ar }),
        slug,
        description: buildJsonField({ en: form.description_en, fr: form.description_fr, ar: form.description_ar }),
        shortDesc: buildJsonField({ en: form.shortDesc_en, fr: form.shortDesc_fr, ar: form.shortDesc_ar }),
        images: JSON.stringify(form.images),
        coverImage: form.coverImage || null,
        status: form.status,
        featured: form.featured,
        order: form.order,
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

  const updateForm = (key: keyof FormData, value: string | boolean | number | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMachine = (machineId: string) => {
    setForm((prev) => ({
      ...prev,
      machineIds: prev.machineIds.includes(machineId)
        ? prev.machineIds.filter((id) => id !== machineId)
        : [...prev.machineIds, machineId],
    }));
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
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                      <TableCell>{item.order}</TableCell>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Production Line' : 'Add Production Line'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] pr-4">
            <div className="space-y-4 pb-4">
              {/* Name tabs */}
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

              {/* Description tabs */}
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

              {/* Short Description tabs */}
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

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="production-line-slug" />
              </div>

              <ImageGalleryUpload
                images={form.images}
                onChange={(urls) => updateForm('images', urls)}
                label="Gallery Images"
                folder="production-lines"
              />

              <ImageUpload
                value={form.coverImage}
                onChange={(url) => updateForm('coverImage', url)}
                label="Cover Image"
                placeholder="Upload or paste cover image URL"
                folder="production-lines"
                previewClassName="h-32 w-full"
              />

              {/* Machine Selection */}
              <div className="space-y-2">
                <Label>Machines</Label>
                <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-1">
                  {machines.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">No machines available</p>
                  ) : (
                    machines.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 p-1 hover:bg-muted rounded">
                        <Checkbox
                          checked={form.machineIds.includes(m.id)}
                          onCheckedChange={() => toggleMachine(m.id)}
                        />
                        <span className="text-sm">{getLocalizedValue(m.name, 'fr')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

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
