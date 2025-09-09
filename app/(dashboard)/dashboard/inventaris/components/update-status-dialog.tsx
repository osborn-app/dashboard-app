'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (ids: number[], status: 'pending' | 'verified') => void;
  selectedCount: number;
  selectedItems?: number[]; // Add this prop to receive actual selected item IDs
}

export function UpdateStatusDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  selectedCount, 
  selectedItems = [] 
}: UpdateStatusDialogProps) {
  const [status, setStatus] = useState<'pending' | 'verified'>('verified');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedCount === 0) return;

    setIsSubmitting(true);
    
    try {
      // Use actual selected item IDs if available, otherwise fallback to mock
      const idsToUpdate = selectedItems.length > 0 ? selectedItems : Array.from({ length: selectedCount }, (_, i) => i + 1);
      onSubmit(idsToUpdate, status);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'verified') => {
    if (status === 'verified') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusDescription = (status: 'pending' | 'verified') => {
    if (status === 'verified') {
      return 'Item akan ditandai sebagai sudah diverifikasi dan siap digunakan';
    }
    return 'Item akan ditandai sebagai pending dan menunggu verifikasi';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Status Inventaris</DialogTitle>
          <DialogDescription>
            Update status untuk {selectedCount} item inventaris yang dipilih
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-muted-foreground">
              Aksi ini akan mengubah status {selectedCount} item inventaris sekaligus
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status Baru</Label>
            <Select value={status} onValueChange={(value: 'pending' | 'verified') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="verified">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Verified
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {getStatusIcon(status)}
              <div>
                <div className="font-medium">
                  Status: <Badge variant={status === 'verified' ? 'default' : 'secondary'}>
                    {status === 'verified' ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getStatusDescription(status)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || selectedCount === 0}
          >
            {isSubmitting ? 'Memperbarui...' : `Update ${selectedCount} Item`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
