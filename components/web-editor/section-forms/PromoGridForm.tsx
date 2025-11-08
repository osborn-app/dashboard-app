'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, X, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import useAxiosAuth from '@/hooks/axios/use-axios-auth';
import Alert from '@/lib/sweetalert';

interface PromoItem {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
}

interface PromoGridFormProps {
  initialData?: {
    title?: string;
    promos?: PromoItem[];
  };
  onDataChange: (data: { title: string; promos: PromoItem[] }) => void;
}

export default function PromoGridForm({
  initialData,
  onDataChange,
}: PromoGridFormProps) {
  const axiosAuth = useAxiosAuth();

  const [title, setTitle] = useState(initialData?.title || 'PROMO SPESIAL BUAT KAMU');
  const [promos, setPromos] = useState<PromoItem[]>(
    initialData?.promos || []
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Update parent whenever data changes
  useEffect(() => {
    onDataChange({ title, promos });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, promos]);

  const handleImageUpload = async (file: File, index: number) => {
    setUploadingIndex(index);
    try {
      const file_names = [file.name];

      const response = await axiosAuth.post('/storages/presign/list', {
        file_names: file_names,
        folder: 'web-content',
      });

      const presignData = response.data;

      for (let i = 0; i < file_names.length; i++) {
        await axios.put(presignData[i].upload_url, file, {
          headers: {
            'Content-Type': file.type,
          },
        });
      }

      // Update promo image
      const newPromos = [...promos];
      newPromos[index] = { ...newPromos[index], image: presignData[0].download_url };
      setPromos(newPromos);

      Alert.success('Berhasil', 'Gambar berhasil diupload!');
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.error('Gagal', 'Gagal mengupload gambar.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddPromo = () => {
    const newPromo: PromoItem = {
      id: `promo-${Date.now()}`,
      image: '',
      title: '',
      description: '',
      link: '',
    };
    setPromos([...promos, newPromo]);
  };

  const handleRemovePromo = (index: number) => {
    const newPromos = promos.filter((_, i) => i !== index);
    setPromos(newPromos);
  };

  const handlePromoChange = (
    index: number,
    field: keyof PromoItem,
    value: string
  ) => {
    const newPromos = [...promos];
    newPromos[index] = { ...newPromos[index], [field]: value };
    setPromos(newPromos);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="grid gap-2">
        <Label htmlFor="promo-title">Section Title</Label>
        <Input
          id="promo-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., PROMO SPESIAL BUAT KAMU"
        />
      </div>

      {/* Promo Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Promo Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPromo}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Promo
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {promos.map((promo, index) => (
            <div
              key={promo.id}
              className="relative rounded-lg border bg-gray-50 p-3"
            >
              {/* Delete Button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2 z-10 h-6 w-6 p-0"
                onClick={() => handleRemovePromo(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              {/* Image Upload */}
              <div className="mb-3">
                <div className="relative h-32 w-full overflow-hidden rounded-md border-2 border-dashed border-gray-300 bg-white">
                  {promo.image ? (
                    <Image
                      src={promo.image}
                      alt={`Promo ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {uploadingIndex === index ? (
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* Upload overlay */}
                  {!uploadingIndex && (
                    <label
                      htmlFor={`promo-image-${index}`}
                      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-30"
                    >
                      <input
                        id={`promo-image-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, index);
                        }}
                        disabled={uploadingIndex !== null}
                      />
                      <Upload className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
                    </label>
                  )}
                </div>
              </div>

              {/* Promo Fields */}
              <div className="space-y-2">
                <Input
                  placeholder="Title"
                  value={promo.title}
                  onChange={(e) =>
                    handlePromoChange(index, 'title', e.target.value)
                  }
                  className="h-8 text-xs"
                />
                <Input
                  placeholder="Description"
                  value={promo.description}
                  onChange={(e) =>
                    handlePromoChange(index, 'description', e.target.value)
                  }
                  className="h-8 text-xs"
                />
                <Input
                  placeholder="Link URL"
                  value={promo.link}
                  onChange={(e) =>
                    handlePromoChange(index, 'link', e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
          ))}

          {/* Add Promo Card */}
          {promos.length === 0 && (
            <button
              type="button"
              onClick={handleAddPromo}
              className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100"
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Add First Promo</p>
              </div>
            </button>
          )}
        </div>

        {promos.length > 0 && (
          <p className="text-xs text-gray-500">
            Total: {promos.length} promo item(s)
          </p>
        )}
      </div>
    </div>
  );
}

