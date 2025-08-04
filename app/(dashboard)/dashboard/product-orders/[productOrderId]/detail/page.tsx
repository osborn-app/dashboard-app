"use client";
import BreadCrumb from "@/components/breadcrumb";
import { useGetDetailProductOrder } from "@/hooks/api/useProductOrder";
import { useOrderCalculate } from "@/hooks/api/useOrder";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { getPaymentStatusLabel, getStatusVariant } from "../types/product-order";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Phone, Mail, User } from "lucide-react";
import Link from "next/link";
import Spinner from "@/components/spinner";
import { useSidebar } from "@/hooks/useSidebar";
import { useState, useEffect } from "react";

dayjs.locale("id");

const ProductOrderDetailPage = () => {
  const { isMinimized } = useSidebar();
  const params = useParams();
  const productOrderId = params.productOrderId as string;
  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);

const breadcrumbItems = [
  { title: "Product Orders", link: "/dashboard/product-orders" },
    { title: "Detail Product Order", link: "/dashboard/product-orders/detail" },
  ];

  const { data: productOrder, isLoading, error } = useGetDetailProductOrder(productOrderId);
  const { mutate: calculatePrice } = useOrderCalculate();

  // Calculate price when product order data is loaded
  useEffect(() => {
    if (productOrder?.data) {
      // Debug: Log the product data
      console.log("Product Order Data:", productOrder.data);
      console.log("Product ID:", productOrder.data.product?.id);
      console.log("Product ID type:", typeof productOrder.data.product?.id);
      
      const calculatePayload = {
        customer_id: parseInt(productOrder.data.customer_id?.toString() || "0"),
        product_id: parseInt(productOrder.data.product?.id?.toString() || "0"), // Use product_id for product orders
        date: productOrder.data.start_date, // Backend expects 'date' field
        duration: parseInt(productOrder.data.duration?.toString() || "0"),
        description: productOrder.data.description,
        start_request: {
          is_self_pickup: productOrder.data.start_request?.is_self_pickup || false,
          driver_id: parseInt(productOrder.data.start_request?.driver?.id?.toString() || "0"),
          distance: parseFloat(productOrder.data.start_request?.distance?.toString() || "0"),
          address: productOrder.data.start_request?.address || "",
        },
        end_request: {
          is_self_pickup: productOrder.data.end_request?.is_self_pickup || false,
          driver_id: parseInt(productOrder.data.end_request?.driver?.id?.toString() || "0"),
          distance: parseFloat(productOrder.data.end_request?.distance?.toString() || "0"),
          address: productOrder.data.end_request?.address || "",
        },
        additional_services: productOrder.data.additional_services?.map((service: any) => ({
          name: service.name,
          price: parseInt(service.price?.toString() || "0"),
        })) || [],
        discount: parseInt(productOrder.data.discount?.toString() || "0"),
        service_price: 0, // Required for product orders with delivery service
        is_with_driver: false, // Product orders don't use driver
        is_out_of_town: false, // Product orders don't use out of town
      };

      // Debug: Log the payload
      console.log("Calculate Price Payload:", calculatePayload);

      calculatePrice(calculatePayload, {
        onSuccess: (data) => {
          setCalculatedPrice(data.data);
        },
        onError: (error: any) => {
          console.error("Failed to calculate price:", error);
          console.error("Error response:", error?.response?.data);
        },
      });
    }
  }, [productOrder?.data, calculatePrice]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        <Spinner />
      </div>
    );
  }

  if (error || !productOrder) {
  return (
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
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
    <div className="flex-1 space-y-4 p-5">
      <BreadCrumb items={breadcrumbItems} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Detail Product Order
          </h1>
          <p className="text-gray-600 mt-2">
            Invoice: {productOrder.data?.invoice_number}
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
                <User className="h-5 w-5" />
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
                    {productOrder.data?.product?.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kategori
                  </label>
                  <p className="text-lg font-semibold">
                    {productOrder.data?.product?.category_label}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Model
                  </label>
                  <p className="text-lg font-semibold">
                    {productOrder.data?.product?.model}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status Produk
                  </label>
                  <Badge variant="secondary">
                    {productOrder.data?.product?.status_label}
                  </Badge>
                </div>
              </div>

              {productOrder.data?.product?.specifications && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Spesifikasi
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Warna</p>
                      <p className="font-medium">{productOrder.data?.product?.specifications.color}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Storage</p>
                      <p className="font-medium">{productOrder.data?.product?.specifications.storage}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Battery Level</p>
                      <p className="font-medium">{productOrder.data?.product?.specifications.battery_level}%</p>
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
                    {dayjs(productOrder.data?.start_date).format("dddd, DD MMMM YYYY")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Jam {dayjs(productOrder.data?.start_date).format("HH:mm")} WIB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tanggal Selesai
                  </label>
                  <p className="text-lg font-semibold">
                    {dayjs(productOrder.data?.end_date).format("dddd, DD MMMM YYYY")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Jam {dayjs(productOrder.data?.end_date).format("HH:mm")} WIB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Durasi
                  </label>
                  <p className="text-lg font-semibold">
                    {productOrder.data?.duration} Hari
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Deskripsi
                  </label>
                  <p className="text-lg font-semibold">
                    {productOrder.data?.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          {productOrder.data?.additional_services && productOrder.data.additional_services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Layanan Tambahan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productOrder.data?.additional_services.map((service: any, index: number) => (
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

          {/* Insurance
          {productOrder.data?.insurance && (
            <Card>
              <CardHeader>
                <CardTitle>Asuransi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{productOrder.data?.insurance.name}</p>
                      <p className="text-sm text-gray-600">{productOrder.data?.insurance.description}</p>
                    </div>
                    <p className="font-semibold">{formatRupiah(productOrder.data?.insurance.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )} */}
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
                <p className="text-lg font-semibold">{productOrder.data?.customer.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{productOrder.data?.customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{productOrder.data?.customer.phone_number}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <Badge variant="outline" className="mt-1">
                  {productOrder.data?.customer.status}
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
                  className={`mt-1 ${getStatusVariant(productOrder.data?.status)}`}
                >
                  {productOrder.data?.order_status_text}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status Pembayaran
                </label>
                <Badge 
                  className={`mt-1 ${getStatusVariant(productOrder.data?.payment_status)}`}
                >
                  {getPaymentStatusLabel(productOrder.data?.payment_status)}
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
               {calculatedPrice ? (
                 <>
                   <div className="flex justify-between">
                     <span>Harga Sewa</span>
                     <span>{formatRupiah(calculatedPrice.rent_price)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Total Harga Sewa</span>
                     <span>{formatRupiah(calculatedPrice.total_rent_price)}</span>
                   </div>
                   {calculatedPrice.service_price > 0 && (
                     <div className="flex justify-between">
                       <span>Biaya Layanan</span>
                       <span>{formatRupiah(calculatedPrice.service_price)}</span>
                     </div>
                   )}
                   {calculatedPrice.driver_price > 0 && (
                     <div className="flex justify-between">
                       <span>Biaya Driver</span>
                       <span>{formatRupiah(calculatedPrice.driver_price)}</span>
                     </div>
                   )}
                   {calculatedPrice.total_driver_price > 0 && (
                     <div className="flex justify-between">
                       <span>Total Biaya Driver</span>
                       <span>{formatRupiah(calculatedPrice.total_driver_price)}</span>
                     </div>
                   )}
                   {calculatedPrice.out_of_town_price > 0 && (
                     <div className="flex justify-between">
                       <span>Biaya Out of Town</span>
                       <span>{formatRupiah(calculatedPrice.out_of_town_price)}</span>
                     </div>
                   )}
                   {calculatedPrice.weekend_price > 0 && (
                     <div className="flex justify-between">
                       <span>Biaya Weekend</span>
                       <span>{formatRupiah(calculatedPrice.weekend_price)}</span>
                     </div>
                   )}
                   {calculatedPrice.total_weekend_price > 0 && (
                     <div className="flex justify-between">
                       <span>Total Biaya Weekend</span>
                       <span>{formatRupiah(calculatedPrice.total_weekend_price)}</span>
                     </div>
                   )}
                   {calculatedPrice.additional_services && calculatedPrice.additional_services.length > 0 && (
                     <div className="flex justify-between">
                       <span>Layanan Tambahan</span>
                       <span>
                         {formatRupiah(
                           calculatedPrice.additional_services.reduce((sum: number, service: any) => sum + service.price, 0)
                         )}
                       </span>
                     </div>
                   )}
                   {calculatedPrice.insurance && calculatedPrice.insurance_price > 0 && (
                     <div className="flex justify-between">
                       <span>Asuransi</span>
                       <span>{formatRupiah(calculatedPrice.insurance_price)}</span>
                     </div>
                   )}
                   <Separator />
                   <div className="flex justify-between">
                     <span>Sub Total</span>
                     <span>{formatRupiah(calculatedPrice.sub_total)}</span>
                   </div>
                   {calculatedPrice.discount_percentage > 0 && (
                     <div className="flex justify-between text-green-600">
                       <span>Diskon ({calculatedPrice.discount_percentage}%)</span>
                       <span>-{formatRupiah(calculatedPrice.discount)}</span>
                     </div>
                   )}
                   {calculatedPrice.tax > 0 && (
                     <div className="flex justify-between">
                       <span>Pajak</span>
                       <span>{formatRupiah(calculatedPrice.tax)}</span>
                     </div>
                   )}
                   <Separator />
                   <div className="flex justify-between text-lg font-bold">
                     <span>Total</span>
                     <span>{formatRupiah(calculatedPrice.total)}</span>
                   </div>
                   <div className="flex justify-between text-lg font-bold">
                     <span>Grand Total</span>
                     <span>{formatRupiah(calculatedPrice.grand_total)}</span>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="flex justify-between">
                     <span>Harga Sewa</span>
                     <span>{formatRupiah(productOrder.data?.service_price || 0)}</span>
                   </div>
                   {productOrder.data?.driver_price > 0 && (
                     <div className="flex justify-between">
                       <span>Biaya Driver</span>
                       <span>{formatRupiah(productOrder.data?.driver_price)}</span>
                     </div>
                   )}
                   {productOrder.data?.out_of_town_price > 0 && (
                     <div className="flex justify-between">
                       <span>Biaya Out of Town</span>
                       <span>{formatRupiah(productOrder.data?.out_of_town_price)}</span>
                     </div>
                   )}
                   {productOrder.data?.additional_services && productOrder.data.additional_services.length > 0 && (
                     <div className="flex justify-between">
                       <span>Layanan Tambahan</span>
                       <span>
                         {formatRupiah(
                           productOrder.data?.additional_services.reduce((sum: number, service: any) => sum + service.price, 0)
                         )}
                       </span>
                     </div>
                   )}
                   {productOrder.data?.insurance && (
                     <div className="flex justify-between">
                       <span>Asuransi</span>
                       <span>{formatRupiah(productOrder.data?.insurance.price)}</span>
                     </div>
                   )}
                   <Separator />
                   <div className="flex justify-between">
                     <span>Sub Total</span>
                     <span>{formatRupiah(productOrder.data?.sub_total_price)}</span>
                   </div>
                   {productOrder.data?.discount > 0 && (
                     <div className="flex justify-between text-green-600">
                       <span>Diskon ({productOrder.data?.discount}%)</span>
                       <span>-{formatRupiah(productOrder.data?.discount_amount)}</span>
                     </div>
                   )}
                   <Separator />
                   <div className="flex justify-between text-lg font-bold">
                     <span>Total</span>
                     <span>{formatRupiah(productOrder.data?.total_price)}</span>
                   </div>
                 </>
               )}
             </CardContent>
           </Card>

          {/* Location */}
          {productOrder.data?.product?.location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{productOrder.data?.product?.location.name}</p>
                  <p className="text-sm text-gray-600">{productOrder.data?.product?.location.address}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductOrderDetailPage;