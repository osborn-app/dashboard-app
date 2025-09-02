'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, Calendar, Package, DollarSign, Hash } from 'lucide-react';

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

interface ViewInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
}

export function ViewInventoryDialog({ open, onOpenChange, item }: ViewInventoryDialogProps) {
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
      hour: '2-digit',
      minute: '2-digit',
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

  const getStatusDescription = (status: 'pending' | 'verified') => {
    if (status === 'verified') {
      return 'Item ini sudah diverifikasi dan siap digunakan';
    }
    return 'Item ini masih dalam status pending dan menunggu verifikasi';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detail Inventaris</DialogTitle>
          <DialogDescription>
            Informasi lengkap item inventaris
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{item.assetName}</h3>
            <div className="flex justify-center">
              {getStatusBadge(item.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {getStatusDescription(item.status)}
            </p>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Informasi Dasar</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  ID Inventaris
                </div>
                <div className="font-medium">#{item.id}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Jumlah
                </div>
                <div className="font-medium">{item.quantity} unit</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Tanggal Pembelian
              </div>
              <div className="font-medium">{formatDate(item.purchaseDate)}</div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Informasi Keuangan</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Harga Satuan
                </div>
                <div className="font-medium">{formatCurrency(item.unitPrice)}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Total Harga
                </div>
                <div className="font-medium text-lg text-primary">
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Timestamps</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dibuat pada:</span>
                <span className="text-sm font-medium">{formatDate(item.createdAt)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Update terakhir:</span>
                <span className="text-sm font-medium">{formatDate(item.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Status Saat Ini</div>
              <div className="text-lg font-semibold">
                {item.status === 'verified' ? 'Siap Digunakan' : 'Menunggu Verifikasi'}
              </div>
              <p className="text-xs text-muted-foreground">
                {item.status === 'verified' 
                  ? 'Item ini sudah diverifikasi dan dapat digunakan untuk operasional'
                  : 'Item ini perlu diverifikasi sebelum dapat digunakan'
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}