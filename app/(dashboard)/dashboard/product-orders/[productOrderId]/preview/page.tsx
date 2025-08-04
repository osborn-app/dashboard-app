"use client";

import { useGetDetailProductOrder, useAcceptProductOrder, useRejectProductOrder } from "@/hooks/api/useProductOrder";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { getPaymentStatusLabel, getStatusVariant } from "../types/product-order";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Calendar, MapPin, Phone, Mail, User, Package } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/spinner";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

dayjs.locale("id");

const ProductOrderPreviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const productOrderId = params.productOrderId as string;

  const { data: productOrder, isLoading } = useGetDetailProductOrder(productOrderId);
  const acceptProductOrderMutation = useAcceptProductOrder(productOrderId);
  const rejectProductOrderMutation = useRejectProductOrder();

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleAccept = async () => {
    try {
      await acceptProductOrderMutation.mutateAsync({});
      toast.success("Product order berhasil diterima");
      router.push("/dashboard/product-orders");
    } catch (error) {
      toast.error("Gagal menerima product order");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }

    try {
      await rejectProductOrderMutation.mutateAsync({
        orderId: productOrderId,
        reason: rejectReason,
      });
      toast.success("Product order berhasil ditolak");
      setIsRejectDialogOpen(false);
      router.push("/dashboard/product-orders");
    } catch (error) {
      toast.error("Gagal menolak product order");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!productOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Order tidak ditemukan
          </h2>
          <p className="text-gray-600 mb-4">
            Product order yang Anda cari tidak ditemukan atau telah dihapus.
          </p>
          <Link href="/dashboard/product-orders">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Product Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Preview Product Order
          </h1>
          <p className="text-gray-600 mt-2">
            Invoice: {productOrder.invoice_number}
          </p>
        </div>
        <Link href="/dashboard/product-orders">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama Produk
                  </label>
                  <p className="text-lg font-semibold">
                    {productOrder.product.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kategori
                  </label>
                  <p className="text-lg font-semibold">
                    {productOrder.product.category_label}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Model
                  </label>
                  <p className="text-lg font-semibold">
                    {productOrder.product.model}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status Produk
                  </label>
                  <Badge variant="secondary">
                    {productOrder.product.status_label}
                  </Badge>
                </div>
              </div>

              {productOrder.product.specifications && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Spesifikasi
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Warna</p>
                      <p className="font-medium">{productOrder.product.specifications.color}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Storage</p>
                      <p className="font-medium">{productOrder.product.specifications.storage}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Battery Level</p>
                      <p className="font-medium">{productOrder.product.specifications.battery_level}%</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rental Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Sewa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tanggal Mulai
                  </label>
                  <p className="text-lg font-semibold">
                    {dayjs(productOrder.start_date).format("dddd, DD MMMM YYYY")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Jam {dayjs(productOrder.start_date).format("HH:mm")} WIB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tanggal Selesai
                  </label>
                  <p className="text-lg font-semibold">
                    {dayjs(productOrder.end_date).format("dddd, DD MMMM YYYY")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Jam {dayjs(productOrder.end_date).format("HH:mm")} WIB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Durasi
                  </label>
                  <p className="text-lg font-semibold">
                    {productOrder.duration} Hari
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Deskripsi
                  </label>
                  <p className="text-lg font-semibold">
                    {productOrder.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          {productOrder.additional_services && productOrder.additional_services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Layanan Tambahan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productOrder.additional_services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{service.name}</p>
                      </div>
                      <p className="font-semibold">{formatRupiah(service.price)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insurance */}
          {productOrder.insurance && (
            <Card>
              <CardHeader>
                <CardTitle>Asuransi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{productOrder.insurance.name}</p>
                      <p className="text-sm text-gray-600">{productOrder.insurance.description}</p>
                    </div>
                    <p className="font-semibold">{formatRupiah(productOrder.insurance.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nama
                </label>
                <p className="text-lg font-semibold">{productOrder.customer.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{productOrder.customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{productOrder.customer.phone_number}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <Badge variant="outline" className="mt-1">
                  {productOrder.customer.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status Order
                </label>
                <Badge 
                  className={`mt-1 ${getStatusVariant(productOrder.status)}`}
                >
                  {productOrder.order_status_text}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status Pembayaran
                </label>
                <Badge 
                  className={`mt-1 ${getStatusVariant(productOrder.payment_status)}`}
                >
                  {getPaymentStatusLabel(productOrder.payment_status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Rincian Harga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Harga Produk</span>
                <span>{formatRupiah(productOrder.service_price)}</span>
              </div>
              {productOrder.driver_price > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Driver</span>
                  <span>{formatRupiah(productOrder.driver_price)}</span>
                </div>
              )}
              {productOrder.out_of_town_price > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Out of Town</span>
                  <span>{formatRupiah(productOrder.out_of_town_price)}</span>
                </div>
              )}
              {productOrder.additional_services && productOrder.additional_services.length > 0 && (
                <div className="flex justify-between">
                  <span>Layanan Tambahan</span>
                  <span>
                    {formatRupiah(
                      productOrder.additional_services.reduce((sum, service) => sum + service.price, 0)
                    )}
                  </span>
                </div>
              )}
              {productOrder.insurance && (
                <div className="flex justify-between">
                  <span>Asuransi</span>
                  <span>{formatRupiah(productOrder.insurance.price)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span>{formatRupiah(productOrder.sub_total_price)}</span>
              </div>
              {productOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon ({productOrder.discount}%)</span>
                  <span>-{formatRupiah(productOrder.discount_amount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatRupiah(productOrder.total_price)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {productOrder.product.location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{productOrder.product.location.name}</p>
                  <p className="text-sm text-gray-600">{productOrder.product.location.address}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleAccept}
                disabled={acceptProductOrderMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {acceptProductOrderMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Terima Order
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => setIsRejectDialogOpen(true)}
                disabled={rejectProductOrderMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                {rejectProductOrderMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak Order
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Product Order</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menolak product order ini? Berikan alasan penolakan di bawah ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Masukkan alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Tolak Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductOrderPreviewPage;