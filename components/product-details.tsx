"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, User, Calendar, Edit } from "lucide-react";
import { useGetDetailProduct } from "@/hooks/api/useProduct";
import Spinner from "@/components/spinner";
import dayjs from "dayjs";
import Swal from "sweetalert2";

interface ProductDetailsProps {
  productId: string;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  productId,
}) => {
  const { data: productResponse, isLoading, error } = useGetDetailProduct(productId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !productResponse?.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Failed to load product details</p>
      </div>
    );
  }

  const data = productResponse.data;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 text-green-500';
      case 'unavailable':
        return 'bg-red-50 text-red-500';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detail Produk</h1>
          <p className="text-gray-600 mt-2">ID: {data.id}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/products/${productId}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <Link href="/dashboard/products">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informasi Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Image */}
              {data.photo && (
                <div className="flex justify-center mb-4">
                  <img
                    src={data.photo.photo || data.photo}
                    alt={data.name}
                    className="w-48 h-48 rounded-lg object-cover border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      Swal.fire({
                        imageUrl: data.photo.photo || data.photo,
                        imageAlt: data.name,
                        width: '80%',
                        confirmButtonText: 'Tutup',
                        confirmButtonColor: '#3085d6',
                        showCloseButton: true,
                        customClass: {
                          image: 'max-h-[70vh] object-contain'
                        }
                      });
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Multiple Photos */}
              {/* {data.photos && data.photos.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500 mb-2">
                    Foto Produk
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {data.photos.map((photo: any, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.photo || photo}
                          alt={`${data.name} - ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            Swal.fire({
                              imageUrl: photo.photo || photo,
                              imageAlt: `${data.name} - ${index + 1}`,
                              width: '80%',
                              confirmButtonText: 'Tutup',
                              confirmButtonColor: '#3085d6',
                              showCloseButton: true,
                              customClass: {
                                image: 'max-h-[70vh] object-contain'
                              }
                            });
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="text-white text-sm font-medium">
                              Klik untuk memperbesar
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama Produk
                  </label>
                  <p className="text-lg font-semibold">{data.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kategori
                  </label>
                  <p className="text-lg font-semibold">
                    {data.category_label || data.category}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Model
                  </label>
                  <p className="text-lg font-semibold">{data.model || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <Badge 
                    className={cn(
                      getStatusVariant(data.status),
                      "text-xs font-medium px-3 py-1"
                    )}
                  >
                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Harga
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatRupiah(data.price)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dibuat Pada
                  </label>
                  <p className="text-lg font-semibold">
                    {dayjs(data.created_at).format("DD MMMM YYYY, HH:mm")}
                  </p>
                </div>
              </div>

              {/* Specifications */}
              {data.specifications && Object.keys(data.specifications).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2">
                      Spesifikasi
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(data.specifications).map(([key, value]: [string, any]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 capitalize">
                            {key.replace(/_/g, " ")}
                          </p>
                          <p className="font-medium">{value || "-"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              {data.description && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2">
                      Deskripsi
                    </label>
                    <p className="text-sm">{data.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Information */}
          {data.owner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Owner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama
                  </label>
                  <p className="text-lg font-semibold">{data.owner.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nomor Telepon
                  </label>
                  <p className="text-lg font-semibold">{data.owner.phone_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <Badge variant="outline" className="mt-1">
                    {data.owner.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          {data.location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{data.location.name}</p>
                  <p className="text-sm text-gray-600">{data.location.location}</p>
                  {data.location.address && (
                    <p className="text-sm text-gray-600">{data.location.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}; 