"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Check, X, Package, User, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import dayjs from "dayjs";
import { useToast } from "@/components/ui/use-toast";
import { ApprovalModal } from "@/components/modal/approval-modal";
import { RejectModal } from "@/components/modal/reject-modal";
import Spinner from "@/components/spinner";
import {
  getStatusVariant,
  getPaymentStatusLabel,
  getCategoryLabel,
  getProductStatusLabel,
} from "@/app/(dashboard)/dashboard/product-orders/[productOrderId]/types/product-order";
import { useGetDetailOrder, useAcceptOrder, useRejectOrder } from "@/hooks/api/useOrder";

interface ProductOrderPreviewProps {
  productOrderId: string;
}

export const ProductOrderPreview: React.FC<ProductOrderPreviewProps> = ({
  productOrderId,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  // Fetch order data
  const { data: orderResponse, isLoading, error } = useGetDetailOrder(productOrderId);
  const { mutate: approveOrder } = useAcceptOrder(productOrderId);
  const { mutate: rejectOrder } = useRejectOrder();

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

  const handleApprove = async () => {
    setLoading(true);
    approveOrder(undefined, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Product order approved successfully!",
        });
        router.push("/dashboard/product-orders");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Error approving product order",
          description: error?.response?.data?.message || "Something went wrong",
        });
      },
      onSettled: () => {
        setLoading(false);
        setOpenApprovalModal(false);
      },
    });
  };

  const handleReject = async (reason: string) => {
    setRejectLoading(true);
    rejectOrder(
      { orderId: productOrderId, reason },
      {
        onSuccess: () => {
          toast({
            variant: "success",
            title: "Product order rejected successfully!",
          });
          router.push("/dashboard/product-orders");
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error rejecting product order",
            description: error?.response?.data?.message || "Something went wrong",
          });
        },
        onSettled: () => {
          setRejectLoading(false);
          setOpenRejectModal(false);
        },
      }
    );
  };

  const isCustomerVerified = data.customer.status === "verified";
  const isProductAvailable = data.product.status === "available";
  const canApprove = isCustomerVerified && isProductAvailable;

  return (
    <>
      {/* Modals */}
      {openApprovalModal && (
        <ApprovalModal
          heading="product order"
          isOpen={openApprovalModal}
          onClose={() => setOpenApprovalModal(false)}
          onConfirm={handleApprove}
          loading={loading}
          title="Are you sure you want to approve this product order?"
        />
      )}
      
      {openRejectModal && (
        <RejectModal
          isOpen={openRejectModal}
          onClose={() => setOpenRejectModal(false)}
          onConfirm={handleReject}
          loading={rejectLoading}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Product Order Preview</h1>
            <p className="text-muted-foreground">
              Invoice: {data.invoice_number}
            </p>
          </div>
          
          {data.status === "pending" && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setOpenRejectModal(true)}
                disabled={loading || rejectLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                variant="default"
                onClick={() => setOpenApprovalModal(true)}
                disabled={loading || rejectLoading || !canApprove}
                className={cn(buttonVariants({ variant: "main" }))}
              >
                {loading ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            </div>
          )}
        </div>

        {/* Validation Warnings */}
        {(!isCustomerVerified || !isProductAvailable) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Validation Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!isCustomerVerified && (
                <p className="text-sm text-orange-700">
                  ⚠️ Customer is not verified yet
                </p>
              )}
              {!isProductAvailable && (
                <p className="text-sm text-orange-700">
                  ⚠️ Product is not available
                </p>
              )}
              <p className="text-xs text-orange-600 mt-2">
                Please resolve these issues before approving the order.
              </p>
            </CardContent>
          </Card>
        )}

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
                {!isCustomerVerified && (
                  <Badge variant="destructive" className="text-xs">
                    Not Verified
                  </Badge>
                )}
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
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={isCustomerVerified ? "default" : "destructive"}>
                  {data.customer.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
                {!isProductAvailable && (
                  <Badge variant="destructive" className="text-xs">
                    Unavailable
                  </Badge>
                )}
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
                <Badge variant={isProductAvailable ? 'default' : 'destructive'}>
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

            {/* Additional Services */}
            {data.additional_services && data.additional_services.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Additional Services</p>
                  <div className="space-y-2">
                    {data.additional_services.map((service: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">{service.name}</p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(service.price)}
                        </p>
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
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{data.description}</p>
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
              <span>Service Price</span>
              <span>{formatCurrency(data.service_price)}</span>
            </div>
            
            {data.out_of_town_price > 0 && (
              <div className="flex justify-between">
                <span>Out of Town Price</span>
                <span>{formatCurrency(data.out_of_town_price)}</span>
              </div>
            )}
            
            {data.additional_services && data.additional_services.map((service: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span>{service.name}</span>
                <span>{formatCurrency(service.price)}</span>
              </div>
            ))}
            
            {data.driver_price > 0 && (
              <div className="flex justify-between">
                <span>Driver Price</span>
                <span>{formatCurrency(data.driver_price)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>{formatCurrency(data.sub_total_price)}</span>
            </div>
            
            {data.total_tax > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(data.total_tax)}</span>
              </div>
            )}
            
            {/* {data.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({data.discount}%)</span>
                <span>-{formatCurrency(data.discount_amount)}</span>
              </div>
            )} */}
            
            <Separator />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(data.total_price)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};