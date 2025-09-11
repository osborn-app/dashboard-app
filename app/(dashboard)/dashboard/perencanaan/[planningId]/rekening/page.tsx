import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";
import type { Metadata } from "next";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "#" },
  { title: "Daftar Rekening", link: "#" }
];

export const metadata: Metadata = {
  title: "Daftar Rekening | Perencanaan | Transgo",
  description: "Kelola rekening perencanaan",
};

export default function RekeningPage() {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Daftar Rekening" description="Kelola rekening untuk perencanaan" />
        </div>
        <Separator />

        <div className="text-center py-8 text-muted-foreground">
          Daftar Rekening Page - Coming Soon
        </div>
      </div>
    </>
  );
}
