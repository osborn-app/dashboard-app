'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Upload, Loader2, X } from 'lucide-react';
import useAxiosAuth from '@/hooks/axios/use-axios-auth';
import Alert from '@/lib/sweetalert';

interface PaymentMethod {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  icon_url?: string;
}

interface OrderPaymentInfoFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    methods?: PaymentMethod[];
    disclaimer?: string;
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    methods: PaymentMethod[];
    disclaimer: string;
  }) => void;
}

export default function OrderPaymentInfoForm({
  initialData,
  onDataChange,
}: OrderPaymentInfoFormProps) {
  const [title, setTitle] = useState(initialData?.title || 'Pembayaran');
  const [subtitle, setSubtitle] = useState(
    initialData?.subtitle ||
      'Kamu bisa melakukan pembayaran lewat metode resmi berikut ini:',
  );
  const [methods, setMethods] = useState<PaymentMethod[]>(
    initialData?.methods?.length
      ? initialData.methods.map((method, index) => ({
          id: method.id || `payment-method-${index + 1}`,
          bank_name: method.bank_name || '',
          account_name: method.account_name || '',
          account_number: method.account_number || '',
          icon_url: method.icon_url || '',
        }))
      : [
          {
            id: 'payment-method-1',
            bank_name: 'BCA',
            account_name: 'PT MARIFAH CIPTA BANGSA',
            account_number: '0000000000',
            icon_url: '',
          },
        ],
  );
  const [disclaimer, setDisclaimer] = useState(
    initialData?.disclaimer ||
      'Jika transfer di luar metode pembayaran di atas, kami tidak bertanggung jawab atas kerugian yang dialami.',
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const axiosAuth = useAxiosAuth();

  useEffect(() => {
    onDataChange({
      title,
      subtitle,
      methods: methods.map((method, index) => ({
        id: method.id || `payment-method-${index + 1}`,
        bank_name: method.bank_name,
        account_name: method.account_name,
        account_number: method.account_number,
        icon_url: method.icon_url || '',
      })),
      disclaimer,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, methods, disclaimer]);

  const handleMethodChange = (
    index: number,
    field: keyof PaymentMethod,
    value: string,
  ) => {
    const updated = [...methods];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setMethods(updated);
  };

  const handleAddMethod = () => {
    setMethods((prev) => [
      ...prev,
      {
        id: `payment-method-${Date.now()}`,
        bank_name: '',
        account_name: '',
        account_number: '',
      },
    ]);
  };

  const handleRemoveMethod = (index: number) => {
    setMethods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIconUpload = async (file: File, index: number) => {
    setUploadingIndex(index);
    try {
      const fileNames = [file.name];
      const { data: presignData } = await axiosAuth.post(
        '/storages/presign/list',
        {
          file_names: fileNames,
          folder: 'web-content',
        },
      );

      await axios.put(presignData[0].upload_url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      const updated = [...methods];
      updated[index] = {
        ...updated[index],
        icon_url: presignData[0].download_url,
      };
      setMethods(updated);

      Alert.success('Berhasil', 'Icon bank berhasil diupload!');
    } catch (error) {
      console.error('Icon upload error:', error);
      Alert.error('Gagal', 'Gagal mengupload icon bank.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveIcon = (index: number) => {
    const updated = [...methods];
    updated[index] = {
      ...updated[index],
      icon_url: '',
    };
    setMethods(updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label>Section Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Pembayaran"
        />
      </div>

      <div className="grid gap-2">
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Kamu bisa melakukan pembayaran lewat metode resmi berikut ini:"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Metode Pembayaran</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddMethod}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Metode
          </Button>
        </div>

        <div className="space-y-4">
          {methods.map((method, index) => (
            <div key={method.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Nama Bank / Platform</Label>
                  <Input
                    value={method.bank_name}
                    onChange={(e) =>
                      handleMethodChange(index, 'bank_name', e.target.value)
                    }
                    placeholder="Contoh: BCA, Mandiri, Paper"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Atas Nama</Label>
                  <Input
                    value={method.account_name}
                    onChange={(e) =>
                      handleMethodChange(index, 'account_name', e.target.value)
                    }
                    placeholder="Contoh: PT MARIFAH CIPTA BANGSA"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Icon Bank</Label>
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white">
                      {method.icon_url ? (
                        <Image
                          src={method.icon_url}
                          alt={`${method.bank_name} icon`}
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
                        htmlFor={`payment-icon-${index}`}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-30"
                      >
                        <input
                          id={`payment-icon-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleIconUpload(file, index);
                          }}
                          disabled={uploadingIndex !== null}
                        />
                      </label>
                    </div>

                    {method.icon_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveIcon(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Format PNG/JPG transparan, maksimal 1MB.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Nomor Rekening / Referensi</Label>
                  <Input
                    value={method.account_number}
                    onChange={(e) =>
                      handleMethodChange(index, 'account_number', e.target.value)
                    }
                    placeholder="Contoh: 1234567890"
                  />
                </div>

                <div className="flex items-end justify-end">
                  {methods.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMethod(index)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Disclaimer</Label>
        <Textarea
          rows={3}
          value={disclaimer}
          onChange={(e) => setDisclaimer(e.target.value)}
          placeholder="Pesan pengingat mengenai pembayaran resmi..."
        />
      </div>
    </div>
  );
}


