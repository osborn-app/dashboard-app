'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Upload, Loader2, X } from 'lucide-react';
import useAxiosAuth from '@/hooks/axios/use-axios-auth';
import Alert from '@/lib/sweetalert';

interface StepItem {
  id: string;
  number: number;
  title: string;
  description: string;
  image_url?: string;
  image?: string;
  icon?: string;
}

interface StepsFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    steps?: StepItem[];
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    steps: Array<{
      id: string;
      number: number;
      title: string;
      description: string;
      image_url?: string;
    }>;
  }) => void;
}

export default function StepsForm({
  initialData,
  onDataChange,
}: StepsFormProps) {
  const axiosAuth = useAxiosAuth();

  const [title, setTitle] = useState(
    initialData?.title || 'Cara Mudah Sewa Mobil'
  );
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle || 'Ikuti langkah-langkah berikut'
  );
  const [steps, setSteps] = useState<StepItem[]>(
    (initialData?.steps || []).map((step, index) => ({
      id: step.id || `step-${index + 1}`,
      number: step.number ?? index + 1,
      title: step.title || '',
      description: step.description || '',
      image_url: step.image_url || step.image || step.icon || '',
    }))
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const normalizedSteps = steps.map((step, index) => ({
      id: step.id || `step-${index + 1}`,
      number: index + 1,
      title: step.title || '',
      description: step.description || '',
      image_url: step.image_url || '',
    }));

    onDataChange({ title, subtitle, steps: normalizedSteps });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, steps]);

  const handleAddStep = () => {
    const newStep: StepItem = {
      id: `step-${Date.now()}`,
      number: steps.length + 1,
      title: '',
      description: '',
      image_url: '',
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumbered = newSteps.map((step, i) => ({
      ...step,
      number: i + 1,
    }));
    setSteps(renumbered);
  };

  const handleStepChange = (
    index: number,
    field: keyof StepItem,
    value: string
  ) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
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

      const newSteps = [...steps];
      newSteps[index] = {
        ...newSteps[index],
        image_url: presignData[0].download_url,
      };
      setSteps(newSteps);

      Alert.success('Berhasil', 'Gambar berhasil diupload!');
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.error('Gagal', 'Gagal mengupload gambar.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], image_url: '' };
    setSteps(newSteps);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="grid gap-2">
        <Label htmlFor="steps-title">Section Title</Label>
        <Input
          id="steps-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Cara Mudah Sewa Mobil"
        />
      </div>

      {/* Subtitle */}
      <div className="grid gap-2">
        <Label htmlFor="steps-subtitle">Subtitle</Label>
        <Input
          id="steps-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="e.g., Ikuti langkah-langkah berikut"
        />
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Steps</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddStep}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative rounded-lg border bg-gray-50 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                {/* Number Badge */}
                <div className="flex items-center gap-3 md:flex-col md:items-center md:gap-2">
                  <GripVertical className="h-5 w-5 cursor-move text-gray-400" />
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {step.number}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-3">
                  <div className="grid gap-2">
                    <Label className="text-xs uppercase text-gray-500">
                      Step Image
                    </Label>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white">
                        {step.image_url ? (
                          <Image
                            src={step.image_url}
                            alt={`Step ${step.number}`}
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

                        <label
                          htmlFor={`step-image-${index}`}
                          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-30"
                        >
                          <input
                            id={`step-image-${index}`}
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

                      {step.image_url && (
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

                  <Input
                    placeholder="Step title (e.g., Pilih Mobil)"
                    value={step.title}
                    onChange={(e) =>
                      handleStepChange(index, 'title', e.target.value)
                    }
                  />
                  <div className="grid gap-2">
                    <Textarea
                      placeholder="Step description... (HTML supported, e.g., &lt;a href='https://example.com'&gt;klik sini&lt;/a&gt;)"
                      value={step.description}
                      onChange={(e) =>
                        handleStepChange(index, 'description', e.target.value)
                      }
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      HTML tags are supported. Example: &lt;a href="https://osborncarrental.com"&gt;klik sini&lt;/a&gt;
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleRemoveStep(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {steps.length === 0 && (
            <button
              type="button"
              onClick={handleAddStep}
              className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100"
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Add First Step</p>
              </div>
            </button>
          )}
        </div>

        {steps.length > 0 && (
          <p className="text-xs text-gray-500">Total: {steps.length} step(s)</p>
        )}
      </div>
    </div>
  );
}

