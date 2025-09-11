import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React from "react";
import type { Metadata } from "next";

const breadcrumbItems = [
  { title: "Perencanaan", link: "/dashboard/perencanaan" },
  { title: "Detail Perencanaan", link: "#" },
  { title: "Rencana", link: "#" }
];

export const metadata: Metadata = {
  title: "Rencana | Perencanaan | Transgo",
  description: "Kelola rencana anggaran perencanaan",
};

export default function RencanaPage() {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading title="Rencana" description="Kelola rencana anggaran perencanaan" />
        </div>
        <Separator />

        <div className="text-center py-8 text-muted-foreground">
          Rencana Page - Coming Soon
        </div>
      </div>
    </>
  );
}
