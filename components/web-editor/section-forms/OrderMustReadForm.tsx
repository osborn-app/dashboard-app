'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface OrderMustReadItem {
  id: string;
  title: string;
  content: string;
}

interface OrderMustReadFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    items?: OrderMustReadItem[];
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    items: OrderMustReadItem[];
  }) => void;
}

export default function OrderMustReadForm({
  initialData,
  onDataChange,
}: OrderMustReadFormProps) {
  const [title, setTitle] = useState(
    initialData?.title || 'Wajib Dibaca Sebelum Lanjut',
  );
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle ||
      'Sebelum kamu booking, yuk luangin waktu sebentar buat baca info penting ini.',
  );
  const [items, setItems] = useState<OrderMustReadItem[]>(
    initialData?.items?.length
      ? initialData.items.map((item, index) => ({
          id: item.id || `must-read-${index + 1}`,
          title: item.title || '',
          content: item.content || '',
        }))
      : [
          {
            id: 'must-read-1',
            title:
              'Peraturan Sebelum Melakukan Pemesanan Sewa Mobil dan Motor',
            content:
              '<p>Masukkan peraturan sewa kendaraan kamu di sini agar pelanggan memahami ketentuannya.</p>',
          },
        ],
  );

  useEffect(() => {
    onDataChange({
      title,
      subtitle,
      items: items.map((item, index) => ({
        id: item.id || `must-read-${index + 1}`,
        title: item.title,
        content: item.content,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, items]);

  const handleItemChange = (
    index: number,
    field: keyof OrderMustReadItem,
    value: string,
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `must-read-${Date.now()}`,
        title: '',
        content: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="order-must-read-title">Section Title</Label>
        <Input
          id="order-must-read-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Wajib Dibaca Sebelum Lanjut"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="order-must-read-subtitle">Subtitle</Label>
        <Input
          id="order-must-read-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Tambahkan kalimat pengantar..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Informasi Penting</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Item
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label>Judul Informasi</Label>
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      handleItemChange(index, 'title', e.target.value)
                    }
                    placeholder="Contoh: Biaya Overtime"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    rows={4}
                    value={item.content}
                    onChange={(e) =>
                      handleItemChange(index, 'content', e.target.value)
                    }
                    placeholder="Tuliskan detail informasinya..."
                  />
                  <p className="text-xs text-gray-500">
                    Konten mendukung HTML sederhana. Gunakan &lt;p&gt;...&lt;/p&gt; untuk paragraf.
                  </p>
                </div>

                {items.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus Item
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center text-sm text-gray-500">
              Belum ada informasi. Klik "Tambah Item" untuk membuat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


