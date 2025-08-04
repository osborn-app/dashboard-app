import BreadCrumb from "@/components/breadcrumb";
import { ProductOrderForm } from "@/components/forms/product-order-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

const breadcrumbItems = [
  { title: "Product Orders", link: "/dashboard/product-orders" },
  { title: "Create", link: "/dashboard/product-orders/create" },
];

export default function page() {
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <ProductOrderForm 
         isEdit={true}/>
      </div>
    </ScrollArea>
  );
}