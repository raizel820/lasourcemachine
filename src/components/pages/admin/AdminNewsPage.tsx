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
import { getLocalizedValue } from '@/lib/helpers';
import { generateSlug } from '@/lib/helpers';

const ADMIN_HEADERS = { Authorization: 'Bearer admin-token' };

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  images: string;
  author: string | null;
  status: string;
  publishedAt: string | null;
  order: number;
  createdAt: string;
}

interface FormData {
  title_en: string;
  title_fr: string;
  title_ar: string;
  content_en: string;
  content_fr: string;
  content_ar: string;
  excerpt_en: string;
  excerpt_fr: string;
  excerpt_ar: string;
  slug: string;
  coverImage: string;
  author: string;
  status: string;
  publishedAt: string;
  order: number;
}

const emptyForm: FormData = {
  title_en: '',
  title_fr: '',
  title_ar: '',
  content_en: '',
  content_fr: '',
  content_ar: '',
  excerpt_en: '',
  excerpt_fr: '',
  excerpt_ar: '',
  slug: '',
  coverImage: '',
  author: '',
  status: 'draft',
  publishedAt: new Date().toISOString().split('T')[0],
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

export function AdminNewsPage() {
  const [items, setItems] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<NewsPost | null>(null);
  const [deleteItem, setDeleteItem] = useState<NewsPost | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/news?limit=100&status=all', { headers: ADMIN_HEADERS });
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

  const openEdit = (item: NewsPost) => {
    const title = parseJsonField(item.title);
    const content = parseJsonField(item.content);
    const excerpt = parseJsonField(item.excerpt);
    setEditItem(item);
    setForm({
      title_en: title.en || '',
      title_fr: title.fr || '',
      title_ar: title.ar || '',
      content_en: content.en || '',
      content_fr: content.fr || '',
      content_ar: content.ar || '',
      excerpt_en: excerpt.en || '',
      excerpt_fr: excerpt.fr || '',
      excerpt_ar: excerpt.ar || '',
      slug: item.slug,
      coverImage: item.coverImage || '',
      author: item.author || '',
      status: item.status,
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : '',
      order: item.order,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    // Require at least one title language
    if (!form.title_en && !form.title_fr && !form.title_ar) {
      toast.error('At least one title is required (EN, FR, or AR)');
      return;
    }
    if (!form.content_en && !form.content_fr && !form.content_ar) {
      toast.error('At least one content is required (EN, FR, or AR)');
      return;
    }
    setSaving(true);
    try {
      // Generate slug from first available title
      const titleForSlug = form.title_en || form.title_fr || form.title_ar || '';
      const slug = editItem
        ? (form.slug || generateSlug(titleForSlug))
        : generateSlug(titleForSlug);

      const body = {
        title: buildJsonField({ en: form.title_en || '', fr: form.title_fr || '', ar: form.title_ar || '' }),
        slug,
        content: buildJsonField({ en: form.content_en || '', fr: form.content_fr || '', ar: form.content_ar || '' }),
        excerpt: form.excerpt_en || form.excerpt_fr || form.excerpt_ar
          ? buildJsonField({ en: form.excerpt_en || '', fr: form.excerpt_fr || '', ar: form.excerpt_ar || '' })
          : null,
        coverImage: form.coverImage || null,
        author: form.author || null,
        status: form.status,
        publishedAt: form.publishedAt || null,
        order: form.order,
      };

      const url = editItem
        ? `/api/news/${editItem.slug}`
        : '/api/news';
      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editItem ? 'News post updated' : 'News post created');
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
      const res = await fetch(`/api/news/${deleteItem.slug}`, {
        method: 'DELETE',
        headers: ADMIN_HEADERS,
      });
      if (res.ok) {
        toast.success('News post deleted');
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
          <h1 className="text-2xl font-bold">News</h1>
          <p className="text-muted-foreground">Manage your news and blog posts</p>
        </div>
        <Button onClick={openCreate} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Post
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
                  <TableHead>Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No news posts found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.coverImage ? (
                          <img src={item.coverImage} alt="" className="h-10 w-16 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getLocalizedValue(item.title, 'fr')}
                      </TableCell>
                      <TableCell>{item.author || '-'}</TableCell>
                      <TableCell>
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
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
            <DialogTitle>{editItem ? 'Edit News Post' : 'Add News Post'}</DialogTitle>
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
                  <TabsContent value="en"><Input value={form.title_en} onChange={(e) => { updateForm('title_en', e.target.value); if (!editItem) updateForm('slug', generateSlug(e.target.value)); }} placeholder="Title in English" /></TabsContent>
                  <TabsContent value="ar"><Input value={form.title_ar} onChange={(e) => updateForm('title_ar', e.target.value)} placeholder="العنوان بالعربية" dir="rtl" /></TabsContent>
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
                  <TabsContent value="fr"><Textarea value={form.content_fr} onChange={(e) => updateForm('content_fr', e.target.value)} placeholder="Contenu en français" rows={6} /></TabsContent>
                  <TabsContent value="en"><Textarea value={form.content_en} onChange={(e) => updateForm('content_en', e.target.value)} placeholder="Content in English" rows={6} /></TabsContent>
                  <TabsContent value="ar"><Textarea value={form.content_ar} onChange={(e) => updateForm('content_ar', e.target.value)} placeholder="المحتوى بالعربية" rows={6} dir="rtl" /></TabsContent>
                </Tabs>
              </div>

              {/* Excerpt tabs */}
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Tabs defaultValue="fr">
                  <TabsList className="mb-2">
                    <TabsTrigger value="fr">FR</TabsTrigger>
                    <TabsTrigger value="en">EN</TabsTrigger>
                    <TabsTrigger value="ar">AR</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr"><Textarea value={form.excerpt_fr} onChange={(e) => updateForm('excerpt_fr', e.target.value)} placeholder="Extrait" rows={2} /></TabsContent>
                  <TabsContent value="en"><Textarea value={form.excerpt_en} onChange={(e) => updateForm('excerpt_en', e.target.value)} placeholder="Excerpt" rows={2} /></TabsContent>
                  <TabsContent value="ar"><Textarea value={form.excerpt_ar} onChange={(e) => updateForm('excerpt_ar', e.target.value)} placeholder="مقتطف" rows={2} dir="rtl" /></TabsContent>
                </Tabs>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="news-post-slug" />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input value={form.author} onChange={(e) => updateForm('author', e.target.value)} placeholder="Author name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cover Image URL</Label>
                  <Input value={form.coverImage} onChange={(e) => updateForm('coverImage', e.target.value)} placeholder="https://example.com/cover.jpg" />
                </div>
                <div className="space-y-2">
                  <Label>Published At</Label>
                  <Input type="date" value={form.publishedAt} onChange={(e) => updateForm('publishedAt', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
            <AlertDialogTitle>Delete News Post</AlertDialogTitle>
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
