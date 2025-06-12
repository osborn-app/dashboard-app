import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import TablePage from "./table";

export const metadata: Metadata = {
  title: "Wa Blast Partner",
  description: "Halaman Blast Partner",
};


const breadcrumbItems = [{ title: "Data Mitra", link: "/dashboard/wa-blas-partner" }];

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex items-start justify-between">
        <Heading title="Halaman Blast Partner" />
      </div>
      <Separator />
      <TablePage />
    </div>
  );
}
