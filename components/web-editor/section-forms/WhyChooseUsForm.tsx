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

interface ClientLogo {
  id: string;
  image_url: string;
  alt_text: string;
}

interface WhyChooseUsFormProps {
  initialData?: {
    section_title?: string;
    main_title?: string;
    description?: string;
    image?: string;
    why_items?: WhyItem[];
    client_section_title?: string;
    client_section_description?: string;
    client_button_text?: string;
    client_button_link?: string;
    client_logos?: ClientLogo[];
  };
  onDataChange: (data: {
    section_title: string;
    main_title: string;
    description: string;
    image: string;
    why_items: WhyItem[];
    client_section_title: string;
    client_section_description: string;
    client_button_text: string;
    client_button_link: string;
    client_logos: ClientLogo[];
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

  const [clientSectionTitle, setClientSectionTitle] = useState(
    initialData?.client_section_title || 'Klien yang Udah Bareng Kami'
  );
  const [clientSectionDescription, setClientSectionDescription] = useState(
    initialData?.client_section_description ||
      'Transgo dipercaya berbagai perusahaan dan brand untuk kebutuhan sewa kendaraan.'
  );
  const [clientButtonText, setClientButtonText] = useState(
    initialData?.client_button_text || '+ 10.000 klien lainnya'
  );
  const [clientButtonLink, setClientButtonLink] = useState(
    initialData?.client_button_link || '#'
  );
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>(
    initialData?.client_logos || []
  );
  const [uploadingLogoIndex, setUploadingLogoIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    onDataChange({
      section_title: sectionTitle,
      main_title: mainTitle,
      description,
      image: uploadedImageUrl || '',
      why_items: whyItems,
      client_section_title: clientSectionTitle,
      client_section_description: clientSectionDescription,
      client_button_text: clientButtonText,
      client_button_link: clientButtonLink,
      client_logos: clientLogos,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sectionTitle,
    mainTitle,
    description,
    uploadedImageUrl,
    whyItems,
    clientSectionTitle,
    clientSectionDescription,
    clientButtonText,
    clientButtonLink,
    clientLogos,
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

  const handleAddLogo = () => {
    const newLogo: ClientLogo = {
      id: `logo-${Date.now()}`,
      image_url: '',
      alt_text: '',
    };
    setClientLogos((prev) => [...prev, newLogo]);
  };

  const handleRemoveLogo = (index: number) => {
    setClientLogos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogoAltChange = (index: number, value: string) => {
    setClientLogos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], alt_text: value };
      return updated;
    });
  };

  const handleLogoUpload = async (file: File, index: number) => {
    setUploadingLogoIndex(index);
    try {
      const file_names = [file.name];
      const response = await axiosAuth.post('/storages/presign/list', {
        file_names,
        folder: 'web-content',
      });
      const presignData = response.data;

      await axios.put(presignData[0].upload_url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      setClientLogos((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          image_url: presignData[0].download_url,
        };
        return updated;
      });

      Alert.success('Berhasil', 'Logo berhasil diupload!');
    } catch (error) {
      console.error('Logo upload error:', error);
      Alert.error('Gagal', 'Gagal mengupload logo.');
    } finally {
      setUploadingLogoIndex(null);
    }
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
          placeholder="Description paragraph... (HTML supported, e.g., &lt;a href='https://example.com'&gt;klik sini&lt;/a&gt;)"
          rows={3}
        />
        <p className="text-xs text-gray-500">
          HTML tags are supported. Example: &lt;a href="https://osborncarrental.com"&gt;klik sini&lt;/a&gt;
        </p>
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
                    placeholder="Item description... (HTML supported)"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, 'description', e.target.value)
                    }
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    HTML tags are supported.
                  </p>
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

      {/* Client Section */}
      <div className="space-y-4 rounded-lg border bg-white p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Client Highlight Section
            </p>
            <p className="text-xs text-gray-500">
              Konten box biru seperti contoh gambar (logo klien & tombol CTA).
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddLogo}>
            <Plus className="mr-2 h-4 w-4" />
            Add Logo
          </Button>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Client Section Title</Label>
            <Input
              value={clientSectionTitle}
              onChange={(e) => setClientSectionTitle(e.target.value)}
              placeholder="e.g., Klien yang Udah Bareng Kami"
            />
          </div>
          <div className="grid gap-2">
            <Label>Client Section Description</Label>
            <Textarea
              value={clientSectionDescription}
              onChange={(e) => setClientSectionDescription(e.target.value)}
              placeholder="Deskripsi singkat mengenai klien-klien kamu... (HTML supported)"
              rows={2}
            />
            <p className="text-xs text-gray-500">
              HTML tags are supported.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Button Text</Label>
            <Input
              value={clientButtonText}
              onChange={(e) => setClientButtonText(e.target.value)}
              placeholder="e.g., + 10.000 klien lainnya"
            />
          </div>
          <div className="grid gap-2">
            <Label>Button Link (optional)</Label>
            <Input
              value={clientButtonLink}
              onChange={(e) => setClientButtonLink(e.target.value)}
              placeholder="https://transgo.id/clients"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Client Logos</Label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clientLogos.map((logo, index) => (
              <div
                key={logo.id}
                className="relative flex flex-col gap-3 rounded-lg border bg-gray-50 p-4"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7"
                  onClick={() => handleRemoveLogo(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>

                <div className="flex flex-col items-start gap-3">
                  <div className="relative h-20 w-full overflow-hidden rounded-md border-2 border-dashed border-gray-300 bg-white">
                    {logo.image_url ? (
                      <Image
                        src={logo.image_url}
                        alt={logo.alt_text || `Client logo ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {uploadingLogoIndex === index ? (
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        ) : (
                          <Upload className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    )}
                    <label
                      htmlFor={`client-logo-${index}`}
                      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-30"
                    >
                      <input
                        id={`client-logo-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file, index);
                        }}
                        disabled={uploadingLogoIndex !== null}
                      />
                    </label>
                  </div>

                  <div className="w-full space-y-2">
                    <Label className="text-xs">Alt Text</Label>
                    <Input
                      value={logo.alt_text}
                      onChange={(e) => handleLogoAltChange(index, e.target.value)}
                      placeholder="e.g., Logo Gojek"
                    />
                  </div>
                </div>
              </div>
            ))}

            {clientLogos.length === 0 && (
              <button
                type="button"
                onClick={handleAddLogo}
                className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-500 transition-colors hover:border-primary hover:text-primary"
              >
                <div className="text-center">
                  <Plus className="mx-auto h-8 w-8" />
                  <p className="mt-2 text-sm">Add First Logo</p>
                </div>
              </button>
            )}
          </div>

          {clientLogos.length > 0 && (
            <p className="text-xs text-gray-500">
              Total: {clientLogos.length} logo(s)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

