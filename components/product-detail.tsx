import React, { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isEmpty } from "lodash";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { PreviewImage } from "@/components/modal/preview-image";
import { formatRupiah } from "@/lib/utils";
import {
  Package,
  Tag,
  DollarSign,
  CheckCircle,
  MapPin,
  Settings,
} from "lucide-react";

interface Photo {
  id: number;
  created_at: string;
  updated_at: string;
  photo: string;
}

interface Location {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  location: string;
  address: string;
  map_url: string;
  redirect_url: string;
}

interface Product {
  id: number;
  name: string;
  category_label?: string;
  category?: string;
  model?: string;
  price: number;
  status_label?: string;
  status?: string;
  specifications?: Record<string, any>;
  location?: Location | null;
  photo?: Photo;
  photos?: Photo[];
}

interface ProductDetailProps {
  data: Product;
  onClose: () => void;
  innerRef?: React.RefObject<HTMLDivElement>;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  data,
  onClose,
  innerRef,
}) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);

  const onHandlePreview = (file: any) => {
    setContent(file);
    setOpen(true);
  };

  if (!data) return null;

  return (
    <div
      className="p-5 top-10 border rounded-md border-neutral-400 w-full basis-1/3"
      id="detail-sidebar"
      ref={innerRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-center font-semibold text-xl">Produk Detail</h4>
        <Button
          type="button"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "w-[65px] h-[40px]",
          )}
          onClick={onClose}
        >
          Tutup
        </Button>
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <div className="mb-5 gap-2 grid">
            <div className="p-1 flex items-center rounded-full w-full bg-neutral-50">
              <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100">
                <Package />
              </div>
              <div className="flex flex-col ml-4">
                <span className="font-normal text-xs text-neutral-500">
                  Kategori
                </span>
                <span className="font-medium text-sm text-black">
                  {data?.category_label || data?.category || "-"}
                </span>
              </div>
            </div>
            <div className="p-1 flex items-center rounded-full w-full bg-neutral-50">
              <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100">
                <Tag />
              </div>
              <div className="flex flex-col ml-4">
                <span className="font-normal text-xs text-neutral-500">
                  Nama Produk
                </span>
                <span className="font-medium text-sm text-black">
                  {data?.name ?? "-"}
                </span>
              </div>
            </div>
            {data?.model && (
              <div className="p-1 flex items-center rounded-full w-full bg-neutral-50">
                <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100">
                  <Settings />
                </div>
                <div className="flex flex-col ml-4">
                  <span className="font-normal text-xs text-neutral-500">
                    Model
                  </span>
                  <span className="font-medium text-sm text-black">
                    {data.model}
                  </span>
                </div>
              </div>
            )}
            <div className="p-1 flex items-center rounded-full w-full bg-neutral-50">
              <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100">
                <DollarSign />
              </div>
              <div className="flex flex-col ml-4">
                <span className="font-normal text-xs text-neutral-500">
                  Harga
                </span>
                <span className="font-medium text-sm text-green-600">
                  {formatRupiah(data?.price)}
                </span>
              </div>
            </div>
            <div className="p-1 flex items-center rounded-full w-full bg-neutral-50">
              <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100">
                <CheckCircle />
              </div>
              <div className="flex flex-col ml-4">
                <span className="font-normal text-xs text-neutral-500">
                  Status
                </span>
                <span className="font-medium text-sm text-black">
                  {data?.status_label || data?.status || "-"}
                </span>
              </div>
            </div>
            {data?.location && (
              <div className="p-1 flex items-center rounded-full w-full bg-neutral-50">
                <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100">
                  <MapPin />
                </div>
                <div className="flex flex-col ml-4">
                  <span className="font-normal text-xs text-neutral-500">
                    Lokasi
                  </span>
                  <span className="font-medium text-sm text-black">
                    {data.location.name ?? "-"}
                  </span>
                  {data.location.address && (
                    <span className="font-normal text-xs text-neutral-500 mt-1">
                      {data.location.address}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Specifications */}
          {data?.specifications && !isEmpty(data.specifications) && (
            <div className="mb-5">
              <h5 className="font-medium text-sm text-neutral-700 mb-3">Spesifikasi</h5>
              <div className="gap-2 grid">
                {Object.entries(data.specifications).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-1 flex items-center rounded-full w-full bg-neutral-50">
                    <div className="rounded-full h-[40px] w-[40px] flex items-center justify-center bg-neutral-100">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col ml-4">
                      <span className="font-normal text-xs text-neutral-500 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium text-sm text-black">
                        {value || "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {data?.photos && !isEmpty(data.photos) ? (
            <Carousel className="max-w-xs mx-auto">
              <CarouselContent>
                {data.photos.map((photo: any, index: any) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="w-[310px] h-[300px] flex-shrink-0 flex aspect-square items-center justify-center relative">
                        <img
                          src={photo.photo}
                          alt={`Slide ${index}`}
                          className="object-cover cursor-pointer rounded-lg w-full h-full"
                          onClick={() => {
                            setOpen(true);
                            onHandlePreview(photo?.photo);
                          }}
                        />
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {data.photos && data.photos.length > 1 && (
                <>
                  <CarouselPrevious
                    type="button"
                    className="-left-1 top-1/2 -translate-y-1/2 bg-accent"
                  />
                  <CarouselNext
                    type="button"
                    className="-right-1 top-1/2 -translate-y-1/2 bg-accent"
                  />
                </>
              )}
            </Carousel>
          ) : data?.photo ? (
            <div className="flex justify-center">
              <Card className="w-[310px] h-[300px] flex-shrink-0 flex aspect-square items-center justify-center relative">
                <img
                  src={data.photo.photo}
                  alt={data.name}
                  className="object-cover cursor-pointer rounded-lg w-full h-full"
                  onClick={() => {
                    setOpen(true);
                    onHandlePreview(data.photo?.photo);
                  }}
                />
              </Card>
            </div>
          ) : (
            <p className="text-center text-neutral-500">Belum ada Foto</p>
          )}
        </div>
      </div>
      <PreviewImage
        isOpen={open}
        onClose={() => setOpen(false)}
        content={content}
      />
    </div>
  );
}; 