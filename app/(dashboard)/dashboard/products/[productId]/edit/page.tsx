import BreadCrumb from "@/components/breadcrumb";
import { EditProductForm } from "@/components/forms/product-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export default function page({ params }: { params: { productId: string } }) {
  const breadcrumbItems = [
    { title: "Products", link: "/dashboard/products" },
    { title: "Edit", link: `/dashboard/products/${params.productId}/edit` },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <EditProductForm productId={params.productId} />
      </div>
    </ScrollArea>
  );
} 