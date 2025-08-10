import BreadCrumb from "@/components/breadcrumb";
import { ProductDetails } from "@/components/product-details";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export default function page({ params }: { params: { productId: string } }) {
  const breadcrumbItems = [
    { title: "Products", link: "/dashboard/products" },
    { title: "Detail", link: `/dashboard/products/${params.productId}/detail` },
  ];
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <ProductDetails productId={params.productId} />
      </div>
    </ScrollArea>
  );
} 