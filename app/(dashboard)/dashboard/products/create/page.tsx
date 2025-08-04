import BreadCrumb from "@/components/breadcrumb";
import { CreateProductForm } from "@/components/forms/product-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

const breadcrumbItems = [
  { title: "Products", link: "/dashboard/products" },
  { title: "Create", link: "/dashboard/products/create" },
];

export default function page() {
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <CreateProductForm />
      </div>
    </ScrollArea>
  );
} 