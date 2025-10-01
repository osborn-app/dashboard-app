import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";
import type { Metadata } from "next";
import PerencanaanTableWrapper from "./perencanaan-table-wrapper";

const breadcrumbItems = [{ title: "Perencanaan", link: "/dashboard/perencanaan" }];

export const metadata: Metadata = {
  title: "Perencanaan | Transgo",
  description: "Kelola perencanaan keuangan perusahaan",
}; //redeploy

const page = async () => {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Perencanaan" description="Kelola perencanaan keuangan perusahaan" />
        </div>
        <Separator />
        
        <PerencanaanTableWrapper />
      </div>
    </>
  );
};

export default page;
