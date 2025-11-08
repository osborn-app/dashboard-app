'use client';

import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import useAxiosAuth from '@/hooks/axios/use-axios-auth';
import Alert from '@/lib/sweetalert';

interface CtaFormProps {
  initialData?: {
    title?: string;
    description?: string;
    button_text?: string;
    button_url?: string;
    button_style?: 'primary' | 'secondary' | 'outline';
    background_image?: string;
    background_color?: string;
  };
  onDataChange: (data: {
    title: string;
    description: string;
    button_text: string;
    button_url: string;
    button_style: 'primary' | 'secondary' | 'outline';
    background_image: string;
    background_color: string;
  }) => void;
}

export default function CtaForm({ initialData, onDataChange }: CtaFormProps) {
  const axiosAuth = useAxiosAuth();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(
    initialData?.title || 'Siap untuk memulai?'
  );
  const [description, setDescription] = useState(
    initialData?.description || 'Daftar sekarang dan dapatkan promo spesial!'
  );
  const [buttonText, setButtonText] = useState(
    initialData?.button_text || 'Daftar Sekarang'
  );
  const [buttonUrl, setButtonUrl] = useState(
    initialData?.button_url || '/register'
  );
  const [buttonStyle, setButtonStyle] = useState<
    'primary' | 'secondary' | 'outline'
  >(initialData?.button_style || 'primary');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    initialData?.background_image || null
  );
  const [uploadedBgUrl, setUploadedBgUrl] = useState<string | null>(
    initialData?.background_image || null
  );
  const [backgroundColor, setBackgroundColor] = useState(
    initialData?.background_color || '#1E40AF'
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    onDataChange({
      title,
      description,
      button_text: buttonText,
      button_url: buttonUrl,
      button_style: buttonStyle,
      background_image: uploadedBgUrl || '',
      background_color: backgroundColor,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    description,
    buttonText,
    buttonUrl,
    buttonStyle,
    uploadedBgUrl,
    backgroundColor,
  ]);

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

      setBackgroundImage(presignData[0].download_url);
      setUploadedBgUrl(presignData[0].download_url);

      Alert.success('Berhasil', 'Background berhasil diupload!');
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.error('Gagal', 'Gagal mengupload background.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    setUploadedBgUrl(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="grid gap-2">
        <Label htmlFor="cta-title">Title</Label>
        <Input
          id="cta-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Siap untuk memulai?"
        />
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="cta-description">Description</Label>
        <Textarea
          id="cta-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Daftar sekarang dan dapatkan promo spesial!"
          rows={3}
        />
      </div>

      {/* Button Config */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="button-text">Button Text</Label>
          <Input
            id="button-text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="e.g., Daftar Sekarang"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="button-url">Button URL</Label>
          <Input
            id="button-url"
            value={buttonUrl}
            onChange={(e) => setButtonUrl(e.target.value)}
            placeholder="e.g., /register or https://..."
          />
        </div>
      </div>

      {/* Button Style */}
      <div className="grid gap-2">
        <Label htmlFor="button-style">Button Style</Label>
        <Select value={buttonStyle} onValueChange={(val: any) => setButtonStyle(val)}>
          <SelectTrigger id="button-style">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary (Solid)</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Background Image (Optional) */}
      <div className="grid gap-2">
        <Label>Background Image (Optional)</Label>
        <div
          className={`relative flex h-32 items-center justify-center rounded-md border-2 border-dashed ${
            backgroundImage ? 'border-gray-300' : 'border-gray-200'
          } bg-gray-50`}
        >
          {backgroundImage ? (
            <>
              <Image
                src={backgroundImage}
                alt="CTA Background"
                fill
                className="rounded-md object-cover"
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
              htmlFor="cta-bg-upload"
              className="flex cursor-pointer flex-col items-center justify-center text-gray-500"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
              <span className="mt-2 text-sm">
                {isUploading ? 'Uploading...' : 'Upload Background (Optional)'}
              </span>
            </label>
          )}
          <input
            id="cta-bg-upload"
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

      {/* Background Color */}
      <div className="grid gap-2">
        <Label htmlFor="bg-color">Background Color (if no image)</Label>
        <div className="flex gap-2">
          <Input
            id="bg-color"
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-10 w-20"
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            placeholder="#1E40AF"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}

