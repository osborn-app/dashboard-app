'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Upload, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import {
  MediaAsset,
  MediaAssetType,
  useCreateMediaAsset,
  useGetMediaAssets,
  useDeleteMediaAsset,
} from '@/hooks/api/useWebContent';
import useAxiosAuth from '@/hooks/axios/use-axios-auth';
import Alert from '@/lib/sweetalert';

interface MediaAssetPickerProps {
  selectedIds: number[];
  onAdd: (asset: MediaAsset) => void;
  onRemove?: (assetId: number) => void;
  multiple?: boolean;
  type?: MediaAssetType;
  title?: string;
  helperText?: string;
}

const typeLabelMap: Record<MediaAssetType, string> = {
  company_logo: 'Company Logo',
  media_logo: 'Media Logo',
  partner_logo: 'Partner Logo',
  other: 'Other Asset',
};

const MediaAssetPicker: React.FC<MediaAssetPickerProps> = ({
  selectedIds,
  onAdd,
  onRemove,
  multiple = true,
  type = 'media_logo',
  title,
  helperText,
}) => {
  const axiosAuth = useAxiosAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { data: assets = [], isLoading, refetch, isFetching } = useGetMediaAssets(type);
  const createAsset = useCreateMediaAsset();
  const deleteAsset = useDeleteMediaAsset();

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { data } = await axiosAuth.post('/storages/presign/list', {
        file_names: [file.name],
        folder: 'web-content',
      });

      const presignData = data?.[0];
      if (!presignData?.upload_url || !presignData?.download_url) {
        throw new Error('Presign URL tidak valid');
      }

      await axios.put(presignData.upload_url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      const derivedName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      await createAsset.mutateAsync({
        type,
        name: derivedName,
        fileUrl: presignData.download_url,
      });

      Alert.success('Berhasil', 'Asset berhasil diunggah');
      await refetch();
    } catch (error: any) {
      Alert.error(
        'Gagal mengunggah',
        error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat mengunggah aset.',
      );
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleAssetClick = (asset: MediaAsset) => {
    const isSelected = selectedIds.includes(asset.id);

    if (isSelected) {
      onRemove?.(asset.id);
      return;
    }

    if (!multiple && selectedIds.length && onRemove) {
      onRemove(selectedIds[0]);
    }

    onAdd(asset);
  };

  const handleDeleteAsset = async (
    event: React.MouseEvent<HTMLButtonElement>,
    asset: MediaAsset,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const confirm = await Alert.confirm({
      title: 'Hapus Asset?',
      text: `Asset "${asset.name}" akan dihapus permanen.`,
      icon: 'warning',
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      await deleteAsset.mutateAsync(asset.id);
      Alert.success('Berhasil', 'Asset berhasil dihapus.');
      await refetch();
    } catch (error: any) {
      Alert.error(
        'Gagal menghapus',
        error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat menghapus aset.',
      );
    }
  };

  return (
    <div className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">
            {title || `Library (${typeLabelMap[type]})`}
          </h3>
          {helperText ? (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Refresh
              </>
            )}
          </Button>
          <Button size="sm" onClick={handleUploadClick} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-3 w-3" />
                Upload
              </>
            )}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <ScrollArea className="h-auto">
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading assets...
            </div>
          ) : assets.length === 0 ? (
            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
              Belum ada asset. Upload logo untuk mulai menggunakan.
            </div>
          ) : (
            assets.map((asset) => {
              const isSelected = selectedIds.includes(asset.id);
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handleAssetClick(asset)}
                  className={cn(
                    'group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors',
                    isSelected
                      ? 'border-primary/80 bg-primary/10'
                      : 'border-muted hover:border-primary/50 hover:bg-muted/40',
                  )}
                >
                  <div className="relative h-16 w-full overflow-hidden rounded-md bg-muted sm:h-20">
                    <Image
                      src={asset.fileUrl}
                      alt={asset.altText || asset.name}
                      fill
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={(event) => handleDeleteAsset(event, asset)}
                      className="absolute right-1 top-1 hidden rounded-full bg-white/80 p-1 text-muted-foreground shadow-sm transition hover:bg-destructive hover:text-destructive-foreground group-hover:flex"
                      title="Hapus asset"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="line-clamp-3 text-center text-xs font-medium text-muted-foreground group-hover:text-foreground">
                    {asset.name}
                  </span>
                  {isSelected ? (
                    <span className="rounded-full bg-primary/80 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      Dipilih
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MediaAssetPicker;

