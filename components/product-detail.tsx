import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProductDetailProps {
  data: any;
  onClose: () => void;
  innerRef?: React.RefObject<HTMLDivElement>;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  data,
  onClose,
  innerRef,
}) => {
  if (!data) return null;

  return (
    <div
      ref={innerRef}
      className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Detail Produk</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Product Image */}
        {data.photo && (
          <div className="flex justify-center">
            <Image
              src={data.photo.photo}
              alt={data.name}
              width={200}
              height={200}
              className="rounded-lg object-cover"
            />
          </div>
        )}

        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{data.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="font-medium">{data.category_label || data.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="font-medium">{data.model || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Harga</p>
                <p className="font-medium text-green-600">
                  {formatRupiah(data.price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{data.status_label || data.status}</p>
              </div>
            </div>

            {/* Specifications */}
            {data.specifications && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 mb-2">Spesifikasi</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(data.specifications).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <span className="text-gray-500 capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>{" "}
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Location */}
            {data.location && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 mb-2">Lokasi</p>
                  <p className="font-medium">{data.location.name}</p>
                  <p className="text-sm text-gray-600">{data.location.address}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 