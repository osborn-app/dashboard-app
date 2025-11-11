'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MediaAsset } from '@/hooks/api/useWebContent';
import MediaAssetPicker from '../MediaAssetPicker';
import { ArrowDown, ArrowUp, X } from 'lucide-react';

interface MediaLogoItem {
  tempId: string;
  asset_id: number;
  name: string;
  file_url: string;
  alt_text?: string;
  link?: string;
}

interface MediaMentionsFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    logos?: Array<{
      asset_id: number;
      name: string;
      file_url: string;
      alt_text?: string;
      link?: string;
    }>;
  };
  onDataChange: (data: {
    title: string;
    subtitle: string;
    logos: Array<{
      asset_id: number;
      name: string;
      file_url: string;
      alt_text?: string;
      link?: string;
    }>;
  }) => void;
}

const generateTempId = () => Math.random().toString(36).slice(2, 11);

const DEFAULT_TITLE = 'Diliput di Berbagai Media';
const DEFAULT_SUBTITLE =
  'Transgo udah dipercaya banyak pengguna, dan juga pernah diliput oleh beberapa media keren berikut. Yuk, intip siapa aja yang udah bahas layanan sewa mobil & motor terdekat dari Transgo!';

export default function MediaMentionsForm({ initialData, onDataChange }: MediaMentionsFormProps) {
  const [title, setTitle] = useState(initialData?.title || DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || DEFAULT_SUBTITLE);
  const [logos, setLogos] = useState<MediaLogoItem[]>([]);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!initialData) return;

    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }

    setTitle(initialData?.title || DEFAULT_TITLE);
    setSubtitle(initialData?.subtitle || DEFAULT_SUBTITLE);
    const mapped = initialData?.logos?.map((logo) => ({
      tempId: generateTempId(),
      asset_id: logo.asset_id,
      name: logo.name,
      file_url: logo.file_url,
      alt_text: logo.alt_text || logo.name,
      link: logo.link || '',
    })) || [];
    setLogos(mapped);
  }, [initialData]);

  useEffect(() => {
    isSyncingRef.current = true;
    onDataChange({
      title,
      subtitle,
      logos: logos.map((logo) => ({
        asset_id: logo.asset_id,
        name: logo.name,
        file_url: logo.file_url,
        alt_text: logo.alt_text,
        link: logo.link,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, logos]);

  const selectedIds = useMemo(() => logos.map((logo) => logo.asset_id), [logos]);

  const handleAddLogo = (asset: MediaAsset) => {
    setLogos((prev) => {
      if (prev.some((item) => item.asset_id === asset.id)) {
        return prev;
      }

      return [
        ...prev,
        {
          tempId: generateTempId(),
          asset_id: asset.id,
          name: asset.name,
          file_url: asset.fileUrl,
          alt_text: asset.altText || asset.name,
          link: asset.metadata?.link || '',
        },
      ];
    });
  };

  const handleRemoveLogo = (assetId: number) => {
    setLogos((prev) => prev.filter((item) => item.asset_id !== assetId));
  };

  const handleMoveLogo = (index: number, direction: 'up' | 'down') => {
    setLogos((prev) => {
      const newLogos = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newLogos.length) {
        return prev;
      }

      const temp = newLogos[index];
      newLogos[index] = newLogos[targetIndex];
      newLogos[targetIndex] = temp;
      return newLogos;
    });
  };

  const handleUpdateLogo = (tempId: string, updates: Partial<MediaLogoItem>) => {
    setLogos((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, ...updates } : item)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="media-title">Judul</Label>
          <Input
            id="media-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Dilaput di Berbagai Media"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="media-subtitle">Deskripsi</Label>
          <Textarea
            id="media-subtitle"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Daftar Logo</h3>
          <p className="text-xs text-muted-foreground">
            Pilih logo media yang sudah Anda unggah. Logo akan ditampilkan berurutan sesuai daftar
            di bawah ini.
          </p>
        </div>

        {logos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              Belum ada logo yang dipilih. Silakan pilih dari library di bawah.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {logos.map((logo, index) => (
              <Card key={logo.tempId}>
                <CardContent className="flex gap-4 py-4">
                  <div className="relative h-16 w-28 overflow-hidden rounded-md border bg-muted sm:h-20 sm:w-32">
                    <Image
                      src={logo.file_url}
                      alt={logo.alt_text || logo.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{logo.name}</p>
                        <p className="text-xs text-muted-foreground">Asset #{logo.asset_id}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveLogo(logo.asset_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Alt Text</Label>
                        <Input
                          value={logo.alt_text || ''}
                          onChange={(event) =>
                            handleUpdateLogo(logo.tempId, { alt_text: event.target.value })
                          }
                          placeholder="Deskripsi singkat logo"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Link (opsional)</Label>
                        <Input
                          value={logo.link || ''}
                          onChange={(event) =>
                            handleUpdateLogo(logo.tempId, { link: event.target.value })
                          }
                          placeholder="https://contoh.com/artikel"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveLogo(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="mr-2 h-3 w-3" />
                        Naik
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveLogo(index, 'down')}
                        disabled={index === logos.length - 1}
                      >
                        <ArrowDown className="mr-2 h-3 w-3" />
                        Turun
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MediaAssetPicker
        selectedIds={selectedIds}
        onAdd={handleAddLogo}
        onRemove={handleRemoveLogo}
        multiple
        type="media_logo"
        title="Logo Media"
        helperText="Klik logo untuk menambah atau menghapus dari daftar."
      />
    </div>
  );
}

