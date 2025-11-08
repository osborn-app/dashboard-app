'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import useAxiosAuth from '@/hooks/axios/use-axios-auth';
import Alert from '@/lib/sweetalert';

interface HeroSectionFormProps {
  initialData?: {
    background_image?: string;
    main_title?: string;
    description?: string;
  };
  onDataChange: (data: {
    background_image: string;
    main_title: string;
    description: string;
  }) => void;
}

export default function HeroSectionForm({
  initialData,
  onDataChange,
}: HeroSectionFormProps) {
  const axiosAuth = useAxiosAuth();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    initialData?.background_image || null
  );
  const [uploadedBgUrl, setUploadedBgUrl] = useState<string | null>(
    initialData?.background_image || null
  );
  const [mainTitle, setMainTitle] = useState<string>(
    initialData?.main_title || ''
  );
  const [descTitle, setDescTitle] = useState<string>(
    initialData?.description || ''
  );
  const [isUploading, setIsUploading] = useState(false);

  // Update parent whenever data changes
  useEffect(() => {
    if (uploadedBgUrl && mainTitle && descTitle) {
      onDataChange({
        background_image: uploadedBgUrl,
        main_title: mainTitle,
        description: descTitle,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedBgUrl, mainTitle, descTitle]);

  const uploadImage = async (file: File) => {
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

    return presignData[0].download_url;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      setIsUploading(true);
      try {
        const uploadedUrl = await uploadImage(file);
        setUploadedBgUrl(uploadedUrl);
        Alert.success('Berhasil', 'Gambar berhasil diupload!');
      } catch (error) {
        Alert.error('Gagal', 'Gagal mengupload gambar ke server.');
        setBackgroundImage(null);
      } finally {
        setIsUploading(false);
      }
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
      {/* Background Image Upload */}
      <div className="grid gap-2">
        <Label htmlFor="background-image">Background Image *</Label>
        <div
          className={`relative flex h-48 items-center justify-center rounded-md border-2 border-dashed ${
            backgroundImage ? 'border-gray-300' : 'border-gray-200'
          } bg-gray-50`}
        >
          {backgroundImage ? (
            <>
              <Image
                src={backgroundImage}
                alt="Background Preview"
                fill
                className="rounded-md object-cover"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
                <Button
                  variant="secondary"
                  onClick={handleRemoveImage}
                  className="mr-2"
                  disabled={isUploading}
                  type="button"
                >
                  <X className="mr-2 h-4 w-4" /> Remove
                </Button>
                <Button
                  variant="default"
                  onClick={() => inputFileRef.current?.click()}
                  disabled={isUploading}
                  type="button"
                >
                  <Upload className="mr-2 h-4 w-4" /> Change
                </Button>
              </div>
            </>
          ) : (
            <label
              htmlFor="background-image-upload"
              className="flex cursor-pointer flex-col items-center justify-center text-gray-500"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
              <span className="mt-2 text-sm">
                {isUploading ? 'Uploading...' : 'Upload Background Image'}
              </span>
            </label>
          )}
          <input
            id="background-image-upload"
            type="file"
            accept="image/*"
            ref={inputFileRef}
            onChange={handleImageChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
        {uploadedBgUrl && (
          <p className="text-xs text-green-600">
            ✓ Image uploaded:{' '}
            <a
              href={uploadedBgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {uploadedBgUrl.substring(0, 50)}...
            </a>
          </p>
        )}
      </div>

      {/* Main Title */}
      <div className="grid gap-2">
        <Label htmlFor="main-title">Main Title *</Label>
        <SimpleEditor
          initialContent={mainTitle}
          onChange={setMainTitle}
        />
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="desc-title">Description *</Label>
        <SimpleEditor
          initialContent={descTitle}
          onChange={setDescTitle}
        />
      </div>
    </div>
  );
}

