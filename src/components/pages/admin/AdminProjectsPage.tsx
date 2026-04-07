'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  coverImage: string | null;
  images: string;
  client: string | null;
  location: string | null;
  date: string | null;
  status: string;
  order: number;
}

interface FormData {
  title_en: string;
  title_fr: string;
  title_ar: string;
  description_en: string;
  description_fr: string;
  description_ar: string;
  content_en: string;
  content_fr: string;
  content_ar: string;
  slug: string;
  coverImage: string;
  images: string[];
  client: string;
  location: string;
  date: string;
  status: string;
  order: number;
}

const emptyForm: FormData = {
  title_en: '',
  title_fr: '',
  title_ar: '',
  description_en: '',
  description_fr: '',
  description_ar: '',
  content_en: '',
  content_fr: '',
  content_ar: '',
  slug: '',
  coverImage: '',
  images: [],
  client: '',
  location: '',
  date: '',
  status: 'draft',
  order: 0,
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

export function AdminProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [deleteItem, setDeleteItem] = useState<Project | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/projects?limit=100&status=all', { headers: ADMIN_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
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

  const openEdit = (item: Project) => {
    const title = parseJsonField(item.title);
    const description = parseJsonField(item.description);
    const content = parseJsonField(item.content);
    setEditItem(item);
    setForm({
      title_en: title.en || '',
      title_fr: title.fr || '',
      title_ar: title.ar || '',
      description_en: description.en || '',
      description_fr: description.fr || '',
      description_ar: description.ar || '',
      content_en: content.en || '',
      content_fr: content.fr || '',
      content_ar: content.ar || '',
      slug: item.slug,
      coverImage: item.coverImage || '',
      images: (() => {
        try { return JSON.parse(item.images || '[]'); } catch { return []; }
      })(),
      client: item.client || '',
      location: item.location || '',
      date: item.date || '',
      status: item.status,
      order: item.order,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title_en) {
      toast.error('English title is required');
      return;
    }
    setSaving(true);
    try {
      const slug = editItem
        ? (form.slug || generateSlug(form.title_en))
        : generateSlug(form.title_en);

      const body = {
        title: buildJsonField({ en: form.title_en, fr: form.title_fr, ar: form.title_ar }),
        slug,
        description: buildJsonField({ en: form.description_en, fr: form.description_fr, ar: form.description_ar }),
        content: buildJsonField({ en: form.content_en, fr: form.content_fr, ar: form.content_ar }),
        coverImage: form.coverImage || null,
        images: JSON.stringify(form.images),
        client: form.client || null,
        location: form.location || null,
        date: form.date || null,
        status: form.status,
        order: form.order,
      };

      const url = editItem ? `/api/projects/${editItem.slug}` : '/api/projects';
      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editItem ? 'Project updated' : 'Project created');
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
      const res = await fetch(`/api/projects/${deleteItem.slug}`, {
        method: 'DELETE',
        headers: ADMIN_HEADERS,
      });
      if (res.ok) {
        toast.success('Project deleted');
        setDeleteItem(null);
        fetchData();
      } else {
        toast.error('Delete failed');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const updateForm = (key: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and case studies</p>
        </div>
        <Button onClick={openCreate} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

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
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {getLocalizedValue(item.title, 'fr')}
                      </TableCell>
                      <TableCell>{item.client || '-'}</TableCell>
                      <TableCell>{item.location || '-'}</TableCell>
                      <TableCell>{item.date || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] pr-4">
            <div className="space-y-4 pb-4">
              {/* Title tabs */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Tabs defaultValue="fr">
                  <TabsList className="mb-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                    <TabsTrigger value="ar">AR</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr"><Input value={form.title_fr} onChange={(e) => updateForm('title_fr', e.target.value)} placeholder="Titre en français" /></TabsContent>
                  <TabsContent value="en"><Input value={form.title_en} onChange={(e) => updateForm('title_en', e.target.value)} placeholder="Title in English" /></TabsContent>
                  <TabsContent value="ar"><Input value={form.title_ar} onChange={(e) => updateForm('title_ar', e.target.value)} placeholder="العنوان بالعربية" dir="rtl" /></TabsContent>
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
                  <TabsContent value="fr"><Textarea value={form.description_fr} onChange={(e) => updateForm('description_fr', e.target.value)} placeholder="Description en français" rows={3} /></TabsContent>
                  <TabsContent value="en"><Textarea value={form.description_en} onChange={(e) => updateForm('description_en', e.target.value)} placeholder="Description in English" rows={3} /></TabsContent>
                  <TabsContent value="ar"><Textarea value={form.description_ar} onChange={(e) => updateForm('description_ar', e.target.value)} placeholder="الوصف بالعربية" rows={3} dir="rtl" /></TabsContent>
                </Tabs>
              </div>

              {/* Content tabs */}
              <div className="space-y-2">
                <Label>Content</Label>
                <Tabs defaultValue="fr">
                  <TabsList className="mb-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                    <TabsTrigger value="ar">AR</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr"><Textarea value={form.content_fr} onChange={(e) => updateForm('content_fr', e.target.value)} placeholder="Contenu en français" rows={5} /></TabsContent>
                  <TabsContent value="en"><Textarea value={form.content_en} onChange={(e) => updateForm('content_en', e.target.value)} placeholder="Content in English" rows={5} /></TabsContent>
                  <TabsContent value="ar"><Textarea value={form.content_ar} onChange={(e) => updateForm('content_ar', e.target.value)} placeholder="المحتوى بالعربية" rows={5} dir="rtl" /></TabsContent>
                </Tabs>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="project-slug" />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input value={form.client} onChange={(e) => updateForm('client', e.target.value)} placeholder="Client name" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => updateForm('location', e.target.value)} placeholder="Project location" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => updateForm('date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => updateForm('status', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ImageGalleryUpload
                images={form.images}
                onChange={(urls) => updateForm('images', urls)}
                label="Gallery Images"
                folder="projects"
              />

              <ImageUpload
                value={form.coverImage}
                onChange={(url) => updateForm('coverImage', url)}
                label="Cover Image"
                placeholder="Upload or paste cover image URL"
                folder="projects"
                previewClassName="h-32 w-full"
              />

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
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteItem ? getLocalizedValue(deleteItem.title, 'fr') : ''}&quot;?
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
