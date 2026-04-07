'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLocalizedValue } from '@/lib/helpers';
import { generateSlug } from '@/lib/helpers';

const ADMIN_HEADERS = { Authorization: 'Bearer admin-token' };

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  machineCount?: number;
}

interface FormData {
  name_fr: string;
  name_en: string;
  name_ar: string;
  slug: string;
  icon: string;
  order: number;
}

const emptyForm: FormData = {
  name_fr: '',
  name_en: '',
  name_ar: '',
  slug: '',
  icon: '',
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

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<CategoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/categories', { headers: ADMIN_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch {
      toast.error('Failed to fetch categories');
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

  const openEdit = (item: CategoryItem) => {
    const name = parseJsonField(item.name);
    setEditItem(item);
    setForm({
      name_fr: name.fr || '',
      name_en: name.en || '',
      name_ar: name.ar || '',
      slug: item.slug,
      icon: item.icon || '',
      order: item.order,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name_en && !form.name_fr && !form.name_ar) {
      toast.error('At least one language name is required');
      return;
    }
    setSaving(true);
    try {
      const slug = editItem
        ? (form.slug || generateSlug(form.name_en || form.name_fr || form.name_ar))
        : generateSlug(form.name_en || form.name_fr || form.name_ar);

      const body = {
        name: buildJsonField({ en: form.name_en, fr: form.name_fr, ar: form.name_ar }),
        slug,
        icon: form.icon || null,
        order: form.order,
      };

      const res = editItem
        ? await fetch(`/api/categories/${editItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
            body: JSON.stringify(body),
          })
        : await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
            body: JSON.stringify(body),
          });

      if (res.ok) {
        toast.success(editItem ? 'Category updated' : 'Category created');
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
      const res = await fetch(`/api/categories/${deleteItem.id}`, {
        method: 'DELETE',
        headers: ADMIN_HEADERS,
      });
      if (res.ok) {
        toast.success('Category deleted');
        setDeleteItem(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Delete failed');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const updateForm = (key: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-generate slug from name when not editing
  const handleNameChange = (field: keyof FormData, value: string) => {
    updateForm(field, value);
    if (!editItem && field === 'name_en' && value) {
      updateForm('slug', generateSlug(value));
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!search) return true;
    const name = getLocalizedValue(cat.name, 'fr').toLowerCase();
    const slug = cat.slug.toLowerCase();
    return name.includes(search.toLowerCase()) || slug.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage machine categories</p>
        </div>
        <Button onClick={openCreate} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Input
        placeholder="Search categories..."
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
                  <TableHead className="w-16">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Machines</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
                          <Tag className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{getLocalizedValue(category.name, 'fr')}</div>
                          <div className="text-xs text-muted-foreground">
                            {getLocalizedValue(category.name, 'en')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {category.slug}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.machineCount || 0} machines
                        </Badge>
                      </TableCell>
                      <TableCell>{category.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(category)} className="cursor-pointer">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteItem(category)} className="cursor-pointer text-destructive hover:text-destructive">
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Name tabs */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Tabs defaultValue="fr">
                <TabsList className="mb-2">
                  <TabsTrigger value="fr">FR</TabsTrigger>
                  <TabsTrigger value="en">EN</TabsTrigger>
                  <TabsTrigger value="ar">AR</TabsTrigger>
                </TabsList>
                <TabsContent value="fr">
                  <Input value={form.name_fr} onChange={(e) => handleNameChange('name_fr', e.target.value)} placeholder="Nom en français" />
                </TabsContent>
                <TabsContent value="en">
                  <Input value={form.name_en} onChange={(e) => handleNameChange('name_en', e.target.value)} placeholder="Name in English" />
                </TabsContent>
                <TabsContent value="ar">
                  <Input value={form.name_ar} onChange={(e) => handleNameChange('name_ar', e.target.value)} placeholder="الاسم بالعربية" dir="rtl" />
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="category-slug" />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={String(form.order)} onChange={(e) => updateForm('order', parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon (Lucide icon name, optional)</Label>
              <Input value={form.icon} onChange={(e) => updateForm('icon', e.target.value)} placeholder="e.g., Factory, Wrench, Cog" />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)} className="cursor-pointer">Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving} className="cursor-pointer">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteItem && deleteItem.machineCount && deleteItem.machineCount > 0 ? (
                <>
                  This category has <strong>{deleteItem.machineCount} machine(s)</strong> linked to it.
                  Deleting will unlink all machines from this category. Are you sure you want to delete
                  &quot;{getLocalizedValue(deleteItem.name, 'fr')}&quot;?
                </>
              ) : (
                <>Are you sure you want to delete &quot;{deleteItem ? getLocalizedValue(deleteItem.name, 'fr') : ''}&quot;? This action cannot be undone.</>
              )}
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
