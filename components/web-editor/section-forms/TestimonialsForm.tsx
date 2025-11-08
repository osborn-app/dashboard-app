'use client';

import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import useAxiosAuth from '@/hooks/axios/use-axios-auth';
import Alert from '@/lib/sweetalert';

interface TestimonialItem {
  id: string;
  avatar: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
}

interface TestimonialsFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    testimonials?: TestimonialItem[];
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    testimonials: TestimonialItem[];
  }) => void;
}

export default function TestimonialsForm({
  initialData,
  onDataChange,
}: TestimonialsFormProps) {
  const axiosAuth = useAxiosAuth();

  const [title, setTitle] = useState(
    initialData?.title || 'Apa Kata Mereka'
  );
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle || 'Testimoni dari customer kami'
  );
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    initialData?.testimonials || []
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    onDataChange({ title, subtitle, testimonials });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, testimonials]);

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

      const newTestimonials = [...testimonials];
      newTestimonials[index] = { ...newTestimonials[index], avatar: presignData[0].download_url };
      setTestimonials(newTestimonials);

      Alert.success('Berhasil', 'Avatar berhasil diupload!');
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.error('Gagal', 'Gagal mengupload avatar.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddTestimonial = () => {
    const newTestimonial: TestimonialItem = {
      id: `testimonial-${Date.now()}`,
      avatar: '',
      name: '',
      role: '',
      rating: 5,
      comment: '',
    };
    setTestimonials([...testimonials, newTestimonial]);
  };

  const handleRemoveTestimonial = (index: number) => {
    const newTestimonials = testimonials.filter((_, i) => i !== index);
    setTestimonials(newTestimonials);
  };

  const handleTestimonialChange = (
    index: number,
    field: keyof TestimonialItem,
    value: string | number
  ) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setTestimonials(newTestimonials);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="grid gap-2">
        <Label htmlFor="testimonials-title">Section Title</Label>
        <Input
          id="testimonials-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Apa Kata Mereka"
        />
      </div>

      {/* Subtitle */}
      <div className="grid gap-2">
        <Label htmlFor="testimonials-subtitle">Subtitle</Label>
        <Input
          id="testimonials-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="e.g., Testimoni dari customer kami"
        />
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Testimonials</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTestimonial}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>

        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative rounded-lg border bg-gray-50 p-4"
            >
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => handleRemoveTestimonial(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                {/* Avatar */}
                <div className="grid gap-2">
                  <Label className="text-xs">Avatar</Label>
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-white">
                    {testimonial.avatar ? (
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
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

                    {uploadingIndex !== index && (
                      <label
                        htmlFor={`testimonial-avatar-${index}`}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-30"
                      >
                        <input
                          id={`testimonial-avatar-${index}`}
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

                {/* Details */}
                <div className="space-y-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="Customer name"
                        value={testimonial.name}
                        onChange={(e) =>
                          handleTestimonialChange(index, 'name', e.target.value)
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Role/Company</Label>
                      <Input
                        placeholder="e.g., Customer"
                        value={testimonial.role}
                        onChange={(e) =>
                          handleTestimonialChange(index, 'role', e.target.value)
                        }
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs">Rating (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={testimonial.rating}
                      onChange={(e) =>
                        handleTestimonialChange(
                          index,
                          'rating',
                          parseInt(e.target.value) || 5
                        )
                      }
                      className="h-8"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs">Comment</Label>
                    <Textarea
                      placeholder="Customer comment..."
                      value={testimonial.comment}
                      onChange={(e) =>
                        handleTestimonialChange(index, 'comment', e.target.value)
                      }
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {testimonials.length === 0 && (
            <button
              type="button"
              onClick={handleAddTestimonial}
              className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100"
            >
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Add First Testimonial
                </p>
              </div>
            </button>
          )}
        </div>

        {testimonials.length > 0 && (
          <p className="text-xs text-gray-500">
            Total: {testimonials.length} testimonial(s)
          </p>
        )}
      </div>
    </div>
  );
}

