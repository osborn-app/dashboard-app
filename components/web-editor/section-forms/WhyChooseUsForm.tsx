'use client';

import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Upload, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import useAxiosAuth from '@/hooks/axios/use-axios-auth';
import Alert from '@/lib/sweetalert';

interface WhyItem {
  id: string;
  title: string;
  description: string;
}

interface WhyChooseUsFormProps {
  initialData?: {
    section_title?: string;
    main_title?: string;
    description?: string;
    image?: string;
    why_items?: WhyItem[];
  };
  onDataChange: (data: {
    section_title: string;
    main_title: string;
    description: string;
    image: string;
    why_items: WhyItem[];
  }) => void;
}

export default function WhyChooseUsForm({
  initialData,
  onDataChange,
}: WhyChooseUsFormProps) {
  const axiosAuth = useAxiosAuth();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [sectionTitle, setSectionTitle] = useState(
    initialData?.section_title || 'Why Transgo'
  );
  const [mainTitle, setMainTitle] = useState(
    initialData?.main_title || 'Kenapa Harus Transgo Buat Sewa Mobil dan Motor?'
  );
  const [description, setDescription] = useState(
    initialData?.description ||
      'Kami hadir dengan layanan sewa mobil dan motor di Jakarta yang cepat, mudah, dan pastinya terpercaya.'
  );
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
    initialData?.image || null
  );
  const [whyItems, setWhyItems] = useState<WhyItem[]>(
    initialData?.why_items || []
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    onDataChange({
      section_title: sectionTitle,
      main_title: mainTitle,
      description,
      image: uploadedImageUrl || '',
      why_items: whyItems,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionTitle, mainTitle, description, uploadedImageUrl, whyItems]);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
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

      setImage(presignData[0].download_url);
      setUploadedImageUrl(presignData[0].download_url);

      Alert.success('Berhasil', 'Gambar berhasil diupload!');
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.error('Gagal', 'Gagal mengupload gambar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setUploadedImageUrl(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const handleAddItem = () => {
    const newItem: WhyItem = {
      id: `why-${Date.now()}`,
      title: '',
      description: '',
    };
    setWhyItems([...whyItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = whyItems.filter((_, i) => i !== index);
    setWhyItems(newItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof WhyItem,
    value: string
  ) => {
    const newItems = [...whyItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setWhyItems(newItems);
  };

  return (
    <div className="space-y-6">
      {/* Section Title (Badge) */}
      <div className="grid gap-2">
        <Label htmlFor="section-title">Section Title (Badge)</Label>
        <Input
          id="section-title"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          placeholder="e.g., Why Transgo"
        />
      </div>

      {/* Main Title */}
      <div className="grid gap-2">
        <Label htmlFor="main-title">Main Title</Label>
        <Input
          id="main-title"
          value={mainTitle}
          onChange={(e) => setMainTitle(e.target.value)}
          placeholder="e.g., Kenapa Harus Transgo..."
        />
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description paragraph..."
          rows={3}
        />
      </div>

      {/* Image Upload */}
      <div className="grid gap-2">
        <Label>Illustration Image</Label>
        <div
          className={`relative flex h-48 items-center justify-center rounded-md border-2 border-dashed ${
            image ? 'border-gray-300' : 'border-gray-200'
          } bg-gray-50`}
        >
          {image ? (
            <>
              <Image
                src={image}
                alt="Illustration"
                fill
                className="rounded-md object-contain p-4"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRemoveImage}
                  className="mr-2"
                  disabled={isUploading}
                >
                  <X className="mr-2 h-4 w-4" /> Remove
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => inputFileRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" /> Change
                </Button>
              </div>
            </>
          ) : (
            <label
              htmlFor="image-upload"
              className="flex cursor-pointer flex-col items-center justify-center text-gray-500"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
              <span className="mt-2 text-sm">
                {isUploading ? 'Uploading...' : 'Upload Illustration'}
              </span>
            </label>
          )}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            ref={inputFileRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Why Items (FAQ-style) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Why Items (Expandable)</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {whyItems.map((item, index) => (
            <div
              key={item.id}
              className="relative rounded-lg border bg-gray-50 p-4"
            >
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => handleRemoveItem(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              <div className="space-y-3">
                {/* Title */}
                <div className="grid gap-2">
                  <Label className="text-xs">Item Title {index + 1}</Label>
                  <Input
                    placeholder="e.g., Bisa Sewa Kapan Aja"
                    value={item.title}
                    onChange={(e) =>
                      handleItemChange(index, 'title', e.target.value)
                    }
                  />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="Item description..."
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, 'description', e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {whyItems.length === 0 && (
            <button
              type="button"
              onClick={handleAddItem}
              className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100"
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Add First Why Item</p>
              </div>
            </button>
          )}
        </div>

        {whyItems.length > 0 && (
          <p className="text-xs text-gray-500">Total: {whyItems.length} item(s)</p>
        )}
      </div>
    </div>
  );
}

