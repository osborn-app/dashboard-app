'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, CheckCircle, Clock, Eye } from 'lucide-react';
import { InventoryEditDialog } from './inventory-edit-dialog';
import { InventoryViewDialog } from './inventory-view-dialog';

interface InventoryItem {
  id: number;
  assetName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  status: 'pending' | 'verified';
  createdAt: string;
  updatedAt: string;
}

interface InventoryTableProps {
  data: InventoryItem[];
  onSelectionChange: (selectedIds: number[]) => void;
  onUpdateStatus: (id: number, status: 'pending' | 'verified') => void;
  onDelete: (id: number) => void;
}

export function InventoryTable({ data, onSelectionChange, onUpdateStatus, onDelete }: InventoryTableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(data.map(item => item.id));
      onSelectionChange(data.map(item => item.id));
    } else {
      setSelectedRows([]);
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    let newSelection: number[];
    if (checked) {
      newSelection = [...selectedRows, id];
    } else {
      newSelection = selectedRows.filter(rowId => rowId !== id);
    }
    setSelectedRows(newSelection);
    onSelectionChange(newSelection);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: 'pending' | 'verified') => {
    if (status === 'verified') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const handleStatusUpdate = (id: number, status: 'pending' | 'verified') => {
    onUpdateStatus(id, status);
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Tidak ada data inventaris</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Nama Aset</TableHead>
              <TableHead className="text-center">Jumlah</TableHead>
              <TableHead className="text-right">Harga Satuan</TableHead>
              <TableHead className="text-right">Total Harga</TableHead>
              <TableHead>Tanggal Pembelian</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                    aria-label={`Select row ${item.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.assetName}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(item.totalPrice)}</TableCell>
                <TableCell>{formatDate(item.purchaseDate)}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingItem(item)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingItem(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {item.status === 'pending' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(item.id, 'verified')}
                          className="text-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Verified
                        </DropdownMenuItem>
                      )}
                      {item.status === 'verified' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(item.id, 'pending')}
                          className="text-yellow-600"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Mark as Pending
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onDelete(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {editingItem && (
        <InventoryEditDialog
          open={!!editingItem}
          onOpenChange={(open: boolean) => !open && setEditingItem(null)}
          item={editingItem}
          onSubmit={(updatedItem: Partial<InventoryItem>) => {
            // TODO: Implement update logic with API call
            console.log('Update item:', updatedItem);
            setEditingItem(null);
          }}
        />
      )}

      {viewingItem && (
        <InventoryViewDialog
          open={!!viewingItem}
          onOpenChange={(open) => !open && setViewingItem(null)}
          item={viewingItem}
        />
      )}
    </>
  );
}
