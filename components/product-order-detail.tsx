"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Edit, Eye, Package, User, Calendar, Clock, DollarSign } from "lucide-react";
import dayjs from "dayjs";
import {
  getStatusVariant,
  getPaymentStatusLabel,
  getCategoryLabel,
  getProductStatusLabel,
} from "@/app/(dashboard)/dashboard/product-orders/[productOrderId]/types/product-order";
import { useGetDetailOrder } from "@/hooks/api/useOrder";
import Spinner from "@/components/spinner";

interface ProductOrderDetailProps {
  productOrderId: string;
}

export const ProductOrderDetail: React.FC<ProductOrderDetailProps> = ({
  productOrderId,
}) => {
  const { data: orderResponse, isLoading, error } = useGetDetailOrder(productOrderId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !orderResponse?.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Failed to load product order details</p>
      </div>
    );
  }

  const data = orderResponse.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format("DD MMMM YYYY, HH:mm");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Order Detail</h1>
          <p className="text-muted-foreground">
            Invoice: {data.invoice_number}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/product-orders/${productOrderId}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <Link
            href={`/dashboard/product-orders/${productOrderId}/preview`}
            className={cn(buttonVariants({ variant: "main" }))}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Link>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={cn(
                getStatusVariant(data.status),
                "text-xs font-medium px-3 py-1"
              )}
            >
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={cn(
                getStatusVariant(data.payment_status),
                "text-xs font-medium px-3 py-1"
              )}
            >
              {getPaymentStatusLabel(data.payment_status)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{data.customer.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{data.customer.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{data.customer.phone_number}</p>
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Product Name</p>
              <p className="text-sm text-muted-foreground">{data.product.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Model</p>
              <p className="text-sm text-muted-foreground">{data.product.model}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Category</p>
              <Badge variant="secondary">
                {getCategoryLabel(data.product.category)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Price per Day</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(data.product.price)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant={data.product.status === 'available' ? 'default' : 'destructive'}>
                {getProductStatusLabel(data.product.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">{data.product.location.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(data.start_date)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">End Date</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(data.end_date)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm text-muted-foreground">
                {data.duration} day{data.duration > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Separator />

          {/* Product Specifications */}
          <div>
            <p className="text-sm font-medium mb-2">Product Specifications</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {data.product?.specifications && Object.entries(data.product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {key.replace('_', ' ').charAt(0).toUpperCase() + key.slice(1)}:
                    </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Add-ons */}
          {data.addons && data.addons.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Add-ons</p>
                <div className="space-y-2">
                  {data.addons.map((addon: any) => (
                    <div key={addon.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm">{addon.name}</p>
                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(addon.price * data.duration)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {data.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Notes</p>
                <p className="text-sm text-muted-foreground">{data.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Product ({data.duration} day{data.duration > 1 ? 's' : ''})</span>
            <span>{formatCurrency(data.product.price * data.duration)}</span>
          </div>
          
          {data.addons && data.addons.map((addon: any) => (
            <div key={addon.id} className="flex justify-between">
              <span>{addon.name} ({data.duration} day{data.duration > 1 ? 's' : ''})</span>
              <span>{formatCurrency(addon.price * data.duration)}</span>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(data.total_price)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timestamps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Created At</span>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(data.created_at)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Updated At</span>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(data.updated_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};