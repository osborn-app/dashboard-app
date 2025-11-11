'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface DeliverySlot {
  id: string;
  time_range: string;
  additional_fee: number;
}

interface OrderDeliveryPolicyFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    time_slots?: DeliverySlot[];
    notes?: string[];
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    time_slots: DeliverySlot[];
    notes: string[];
  }) => void;
}

export default function OrderDeliveryPolicyForm({
  initialData,
  onDataChange,
}: OrderDeliveryPolicyFormProps) {
  const [title, setTitle] = useState(
    initialData?.title || 'Ketentuan Antar–Jemput',
  );
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle ||
      'Berikut ini biaya antar-jemput kendaraan per unit kalau dilakukan di luar jam operasional, ya!',
  );
  const [timeSlots, setTimeSlots] = useState<DeliverySlot[]>(
    initialData?.time_slots?.length
      ? initialData.time_slots.map((slot, index) => ({
          id: slot.id || `delivery-slot-${index + 1}`,
          time_range: slot.time_range || '',
          additional_fee: slot.additional_fee ?? 0,
        }))
      : [
          { id: 'delivery-slot-1', time_range: '06:30 – 21:00', additional_fee: 0 },
          { id: 'delivery-slot-2', time_range: '21:01 – 21:29', additional_fee: 20000 },
        ],
  );
  const [notes, setNotes] = useState<string[]>(
    initialData?.notes?.length
      ? initialData.notes
      : [
          'Diambil/dikembalikan ke pool Transgo di luar jam kerja akan dikenakan charge setengah dari biaya di atas.',
          'Mohon dikonfirmasi terlebih dahulu apakah kami bisa melayani di jam tersebut atau tidak.',
        ],
  );

  useEffect(() => {
    onDataChange({
      title,
      subtitle,
      time_slots: timeSlots.map((slot, index) => ({
        id: slot.id || `delivery-slot-${index + 1}`,
        time_range: slot.time_range,
        additional_fee: Number(slot.additional_fee) || 0,
      })),
      notes,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, timeSlots, notes]);

  const handleSlotChange = (
    index: number,
    field: keyof DeliverySlot,
    value: string,
  ) => {
    const updated = [...timeSlots];
    if (field === 'additional_fee') {
      updated[index] = {
        ...updated[index],
        additional_fee: Number(value) || 0,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      } as DeliverySlot;
    }
    setTimeSlots(updated);
  };

  const handleAddSlot = () => {
    setTimeSlots((prev) => [
      ...prev,
      { id: `delivery-slot-${Date.now()}`, time_range: '', additional_fee: 0 },
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    setTimeSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNoteChange = (index: number, value: string) => {
    const updated = [...notes];
    updated[index] = value;
    setNotes(updated);
  };

  const handleAddNote = () => {
    setNotes((prev) => [...prev, '']);
  };

  const handleRemoveNote = (index: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label>Section Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ketentuan Antar–Jemput"
        />
      </div>

      <div className="grid gap-2">
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Deskripsi singkat mengenai ketentuan"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Jam & Biaya Tambahan</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddSlot}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Slot
          </Button>
        </div>

        <div className="space-y-4">
          {timeSlots.map((slot, index) => (
            <div key={slot.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label>Rentang Waktu</Label>
                    <Input
                      value={slot.time_range}
                      onChange={(e) =>
                        handleSlotChange(index, 'time_range', e.target.value)
                      }
                      placeholder="Contoh: 21:01 – 21:29"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Biaya Tambahan</Label>
                    <Input
                      type="number"
                      min={0}
                      value={slot.additional_fee}
                      onChange={(e) =>
                        handleSlotChange(index, 'additional_fee', e.target.value)
                      }
                      placeholder="Contoh: 20000"
                    />
                    <p className="text-xs text-gray-500">
                      Masukkan angka tanpa titik/koma, sistem akan menampilkan format Rupiah.
                    </p>
                  </div>
                </div>

                {timeSlots.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveSlot(index)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Slot
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Catatan Tambahan</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddNote}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Catatan
          </Button>
        </div>

        <div className="space-y-3">
          {notes.map((note, index) => (
            <div key={`note-${index}`} className="flex flex-col gap-2 rounded-lg border bg-white p-3 md:flex-row md:items-start md:gap-4">
              <Textarea
                className="flex-1"
                rows={3}
                value={note}
                onChange={(e) => handleNoteChange(index, e.target.value)}
                placeholder="Tulis catatan tambahan di sini..."
              />
              {notes.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveNote(index)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


