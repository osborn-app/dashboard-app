'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Upload, Loader2, X } from 'lucide-react';
import useAxiosAuth from '@/hooks/axios/use-axios-auth';
import Alert from '@/lib/sweetalert';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  image?: string;
  icon?: string;
  link?: string;
}

interface FeaturesFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    features?: FeatureItem[];
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    features: Array<{
      id: string;
      title: string;
      description: string;
      image_url?: string;
      link?: string;
    }>;
  }) => void;
}

export default function FeaturesForm({
  initialData,
  onDataChange,
}: FeaturesFormProps) {
  const axiosAuth = useAxiosAuth();

  const [title, setTitle] = useState(
    initialData?.title || 'Keunggulan Kami'
  );
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle || 'Mengapa memilih kami?'
  );
  const [features, setFeatures] = useState<FeatureItem[]>(
    (initialData?.features || []).map((feature, index) => ({
      id: feature.id || `feature-${index + 1}`,
      title: feature.title || '',
      description: feature.description || '',
      image_url: feature.image_url || feature.image || feature.icon || '',
      link: feature.link,
    }))
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const normalizedFeatures = features.map((feature, index) => ({
      id: feature.id || `feature-${index + 1}`,
      title: feature.title || '',
      description: feature.description || '',
      image_url: feature.image_url || '',
      link: feature.link,
    }));

    onDataChange({ title, subtitle, features: normalizedFeatures });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, features]);

  const handleAddFeature = () => {
    const newFeature: FeatureItem = {
      id: `feature-${Date.now()}`,
      title: '',
      description: '',
      image_url: '',
    };
    setFeatures([...features, newFeature]);
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  const handleFeatureChange = (
    index: number,
    field: keyof FeatureItem,
    value: string
  ) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeatures(newFeatures);
  };

  const handleImageUpload = async (file: File, index: number) => {
    setUploadingIndex(index);
    try {
      const fileNames = [file.name];
      const { data: presignData } = await axiosAuth.post('/storages/presign/list', {
        file_names: fileNames,
        folder: 'web-content',
      });

      await axios.put(presignData[0].upload_url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      const newFeatures = [...features];
      newFeatures[index] = {
        ...newFeatures[index],
        image_url: presignData[0].download_url,
      };
      setFeatures(newFeatures);

      Alert.success('Berhasil', 'Gambar berhasil diupload!');
    } catch (error) {
      console.error('Feature image upload error:', error);
      Alert.error('Gagal', 'Gagal mengupload gambar.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], image_url: '' };
    setFeatures(newFeatures);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="grid gap-2">
        <Label htmlFor="features-title">Section Title</Label>
        <Input
          id="features-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Keunggulan Kami"
        />
      </div>

      {/* Subtitle */}
      <div className="grid gap-2">
        <Label htmlFor="features-subtitle">Subtitle</Label>
        <Input
          id="features-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="e.g., Mengapa memilih kami?"
        />
      </div>

      {/* Features List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Features</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFeature}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Feature
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="relative rounded-lg border bg-gray-50 p-4"
            >
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => handleRemoveFeature(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              <div className="space-y-3">
                {/* Feature Image */}
                <div className="grid gap-2">
                  <Label className="text-xs uppercase text-gray-500">
                    Feature Image
                  </Label>
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white">
                      {feature.image_url ? (
                        <Image
                          src={feature.image_url}
                          alt={feature.title || `Feature ${index + 1}`}
                          fill
                          className="object-contain p-2"
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
                      <label
                        htmlFor={`feature-image-${index}`}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-30"
                      >
                        <input
                          id={`feature-image-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, index);
                          }}
                          disabled={uploadingIndex !== null}
                        />
                      </label>
                    </div>

                    {feature.image_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Format PNG/JPG, maksimal 2MB.
                  </p>
                </div>

                {/* Title */}
                <div className="grid gap-2">
                  <Label className="text-xs">Title</Label>
                  <Input
                    placeholder="Feature title"
                    value={feature.title}
                    onChange={(e) =>
                      handleFeatureChange(index, 'title', e.target.value)
                    }
                    className="h-8"
                  />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="Feature description... (HTML supported, e.g., &lt;a href='https://example.com'&gt;klik sini&lt;/a&gt;)"
                    value={feature.description}
                    onChange={(e) =>
                      handleFeatureChange(index, 'description', e.target.value)
                    }
                    rows={3}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    HTML tags are supported. Example: &lt;a href="https://osborncarrental.com"&gt;klik sini&lt;/a&gt;
                  </p>
                </div>

                {/* Optional Link */}
                <div className="grid gap-2">
                  <Label className="text-xs">CTA Link (optional)</Label>
                  <Input
                    placeholder="https://transgo.id/layanan"
                    value={feature.link || ''}
                    onChange={(e) =>
                      handleFeatureChange(index, 'link', e.target.value)
                    }
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {features.length === 0 && (
            <button
              type="button"
              onClick={handleAddFeature}
              className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100 md:col-span-2"
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Add First Feature</p>
              </div>
            </button>
          )}
        </div>

        {features.length > 0 && (
          <p className="text-xs text-gray-500">
            Total: {features.length} feature(s)
          </p>
        )}
      </div>
    </div>
  );
}

