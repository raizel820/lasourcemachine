'use client';

import { useState, useEffect } from 'react';
import { Trash2, Loader2, Eye, Mail, Phone, Building, Wrench, PackageSearch, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const ADMIN_HEADERS = { Authorization: 'Bearer admin-token' };

interface LeadItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string;
  subject: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  machine: { id: string; name: string; slug: string } | null;
  serviceId: string | null;
  customMachines: string | null;
  selectedMachineIds: string | null;
}

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'closed'] as const;

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'default',
  contacted: 'secondary',
  qualified: 'outline',
  closed: 'secondary',
};

export function AdminLeadsPage() {
  const [allItems, setAllItems] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<LeadItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const filteredItems = allItems.filter(item => {
    if (statusFilter && statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/leads?limit=100', { headers: ADMIN_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setAllItems(data.data || []);
      }
    } catch {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(leadId);
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchData();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify({ id: deleteItem.id, status: 'deleted' }),
      });
      // Since no DELETE endpoint exists, we show an error
      toast.error('Delete is not supported via API. Change status instead.');
    } catch {
      toast.error('An error occurred');
    }
    setDeleteItem(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads & Inquiries</h1>
          <p className="text-muted-foreground">Manage contact form submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Filter by status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        {lead.email ? (
                          <span className="inline-flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" /> {lead.email}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {lead.phone ? (
                          <span className="inline-flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" /> {lead.phone}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {lead.company ? (
                          <span className="inline-flex items-center gap-1 text-sm">
                            <Building className="h-3 w-3" /> {lead.company}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          {lead.serviceId && (
                            <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 bg-primary/5 border-primary/20 text-primary">
                              <Wrench className="h-2.5 w-2.5 mr-0.5" /> Service
                            </Badge>
                          )}
                          <span className="truncate text-sm">
                            {lead.subject || lead.message.slice(0, 40) + '...'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {updatingStatus === lead.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Select
                            value={lead.status}
                            onValueChange={(v) => handleStatusChange(lead.id, v)}
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)} className="cursor-pointer">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteItem(lead)} className="cursor-pointer text-destructive hover:text-destructive">
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

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={STATUS_COLORS[selectedLead.status] || 'secondary'}>
                    {selectedLead.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedLead.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedLead.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedLead.company || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedLead.subject && (
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{selectedLead.subject}</p>
                </div>
              )}

              {/* Service Request Info */}
              {(selectedLead.serviceId || selectedLead.customMachines || selectedLead.selectedMachineIds) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5" /> Service Request Details
                    </p>

                    {selectedLead.selectedMachineIds && (
                      <div className="rounded-md bg-muted/50 border p-3">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                          <Tag className="h-3 w-3" /> Machines from Catalog
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(() => {
                            try {
                              const ids = JSON.parse(selectedLead.selectedMachineIds);
                              return ids.map((id: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">ID: {id.slice(0, 8)}</Badge>
                              ));
                            } catch {
                              return <span className="text-xs text-muted-foreground">{selectedLead.selectedMachineIds}</span>;
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {selectedLead.customMachines && (
                      <div className="rounded-md bg-muted/50 border p-3">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                          <PackageSearch className="h-3 w-3" /> Custom Machines (Not Listed)
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedLead.customMachines.split(',').map((machine, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                              {machine.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Message</p>
                <div className="mt-1 rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Select
                  value={selectedLead.status}
                  onValueChange={(v) => {
                    handleStatusChange(selectedLead.id, v);
                    setSelectedLead({ ...selectedLead, status: v });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead from {deleteItem?.name || ''}? This action cannot be undone.
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
