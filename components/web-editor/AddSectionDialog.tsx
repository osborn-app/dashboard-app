'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (type: string, name: string) => Promise<void>;
}

const SECTION_TYPES = [
  {
    value: 'hero',
    label: 'Hero Section',
    icon: '🎯',
    description: 'Banner utama dengan background image dan text',
  },
  {
    value: 'why_choose_us',
    label: 'Why Choose Us',
    icon: '✅',
    description: 'Section kenapa harus pilih kita dengan FAQ items',
  },
  {
    value: 'promo_grid',
    label: 'Promo Grid',
    icon: '📱',
    description: 'Grid untuk menampilkan promo/produk',
  },
  {
    value: 'steps',
    label: 'Steps/How It Works',
    icon: '📋',
    description: 'Langkah-langkah atau cara kerja',
  },
  {
    value: 'features',
    label: 'Features',
    icon: '✨',
    description: 'Daftar fitur atau keunggulan',
  },
  {
    value: 'testimonials',
    label: 'Testimonials',
    icon: '💬',
    description: 'Testimoni dari customer',
  },
  {
    value: 'faq',
    label: 'FAQ',
    icon: '❓',
    description: 'Frequently Asked Questions',
  },
  {
    value: 'cta',
    label: 'Call to Action',
    icon: '📢',
    description: 'Tombol ajakan untuk action',
  },
  {
    value: 'custom_html',
    label: 'Custom HTML',
    icon: '🔧',
    description: 'Custom HTML/Content bebas (Supports Tailwind CSS)',
  },
];

export default function AddSectionDialog({
  open,
  onOpenChange,
  onAdd,
}: AddSectionDialogProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [name, setName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!selectedType || !name.trim()) return;

    setIsAdding(true);
    try {
      await onAdd(selectedType, name.trim());
      // Reset form
      setSelectedType('');
      setName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding section:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const selectedTypeInfo = SECTION_TYPES.find((t) => t.value === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Pilih tipe section yang ingin ditambahkan ke halaman ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Section Type */}
          <div className="space-y-2">
            <Label htmlFor="section-type">Section Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="section-type">
                <SelectValue placeholder="Pilih tipe section..." />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTypeInfo && (
              <p className="text-sm text-gray-500">
                {selectedTypeInfo.icon} {selectedTypeInfo.description}
              </p>
            )}
          </div>

          {/* Section Name */}
          <div className="space-y-2">
            <Label htmlFor="section-name">Section Name</Label>
            <Input
              id="section-name"
              placeholder="e.g., Homepage Hero Banner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!selectedType}
            />
            <p className="text-xs text-gray-500">
              Nama ini untuk internal reference, tidak tampil di website.
            </p>
          </div>

          {/* Preview Grid (Optional) */}
          {!selectedType && (
            <div className="rounded-lg border bg-gray-50 p-6">
              <h3 className="mb-3 font-semibold">Available Section Types:</h3>
              <div className="grid grid-cols-2 gap-3">
                {SECTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className="flex items-start gap-3 rounded-lg border bg-white p-3 text-left transition-all hover:border-primary hover:shadow-sm"
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-gray-500">
                        {type.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedType || !name.trim() || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Section'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

