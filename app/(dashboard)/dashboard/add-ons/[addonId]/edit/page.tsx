import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";
import type { Metadata } from "next";
import { AddonEditForm } from "@/components/forms/addon-edit-form";

const breadcrumbItems = [
  { title: "Add-ons", link: "/dashboard/add-ons" },
  { title: "Edit Add-on", link: "/dashboard/add-ons/edit" },
];

export const metadata: Metadata = {
  title: "Edit Add-on | Osborn",
  description: "Edit an existing add-on",
};

const EditAddonPage = ({ params }: { params: { addonId: string } }) => {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title="Edit Add-on"
            description="Edit an existing add-on"
          />
        </div>
        <Separator />
        
        <AddonEditForm addonId={params.addonId} />
      </div>
    </>
  );
};

export default EditAddonPage;
