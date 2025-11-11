'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface FormGuideSection {
  id: string;
  label: string;
  description: string;
}

interface OrderFormGuideFormProps {
  initialData?: {
    title?: string;
    sections?: FormGuideSection[];
  };
  onDataChange: (data: {
    title: string;
    sections: FormGuideSection[];
  }) => void;
}

export default function OrderFormGuideForm({
  initialData,
  onDataChange,
}: OrderFormGuideFormProps) {
  const [title, setTitle] = useState(initialData?.title || 'FORM SEWA SECTION');
  const [sections, setSections] = useState<FormGuideSection[]>(
    initialData?.sections?.length
      ? initialData.sections.map((section, index) => ({
          id: section.id || `form-guide-${index + 1}`,
          label: section.label || '',
          description: section.description || '',
        }))
      : [
          {
            id: 'form-guide-1',
            label: 'Lokasi Kendaraan',
            description:
              'Penjemputan dan pengantaran di luar kantor rental tersedia dengan biaya tambahan. Biaya tersebut tergantung pada jarak antara kantor rental dan lokasi yang Anda inginkan.',
          },
        ],
  );

  useEffect(() => {
    onDataChange({
      title,
      sections: sections.map((section, index) => ({
        id: section.id || `form-guide-${index + 1}`,
        label: section.label,
        description: section.description,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, sections]);

  const handleSectionChange = (
    index: number,
    field: keyof FormGuideSection,
    value: string,
  ) => {
    const updated = [...sections];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setSections(updated);
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `form-guide-${Date.now()}`,
        label: '',
        description: '',
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label>Section Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="FORM SEWA SECTION"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Penjelasan Field</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSection}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Field
          </Button>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <Label>Label Field</Label>
                    <Input
                      value={section.label}
                      onChange={(e) =>
                        handleSectionChange(index, 'label', e.target.value)
                      }
                      placeholder="Contoh: Lokasi Pengambilan"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Deskripsi</Label>
                    <Textarea
                      rows={3}
                      value={section.description}
                      onChange={(e) =>
                        handleSectionChange(index, 'description', e.target.value)
                      }
                      placeholder="Tambahkan penjelasan singkat mengenai field ini..."
                    />
                  </div>
                </div>

                {sections.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveSection(index)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


