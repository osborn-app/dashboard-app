"use client";
import BreadCrumb from "@/components/breadcrumb";
import { Separator } from "@/components/ui/separator";
import BrandTableWrapper from "./brand-table-wrapper";
import BrandHeader from "./components/brand-header";
import { useState } from "react";

const breadcrumbItems = [{ title: "Brand Management", link: "/dashboard/brand" }];

export default function BrandPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <BrandHeader onAddClick={() => setIsCreateDialogOpen(true)} />
      <Separator />
      <BrandTableWrapper 
        isCreateDialogOpen={isCreateDialogOpen}
        onCreateDialogChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
