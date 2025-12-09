import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";
import type { Metadata } from "next";
import { AddonForm } from "@/components/forms/addon-form";

const breadcrumbItems = [
  { title: "Add-ons", link: "/dashboard/add-ons" },
  { title: "Create Add-on", link: "/dashboard/add-ons/create" },
];

export const metadata: Metadata = {
  title: "Create Add-on | Osborn",
  description: "Create a new add-on for products or fleets",
};

const CreateAddonPage = () => {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title="Create Add-on"
            description="Add a new add-on for products or fleets"
          />
        </div>
        <Separator />
        
        <AddonForm />
      </div>
    </>
  );
};

export default CreateAddonPage;
