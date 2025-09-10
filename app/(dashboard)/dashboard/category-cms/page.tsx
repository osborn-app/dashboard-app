import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import DriverMitraTable from "../mitra-drivers/DriverMitraTable";
import CMSCategoryTable from "./cms-category-table";

export const metadata: Metadata = {
  title: "Kategori CMS",
  description: "Halaman Kategori CMS",
};


const breadcrumbItems = [{ title: "CMS Category", link: "/dashboard/cms-category" }];

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex items-start justify-between">
        <Heading title="Kategori CMS" />
      </div>
      <Separator />
        <CMSCategoryTable />
    </div>
  );
}
