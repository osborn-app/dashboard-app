import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import DriverMitraTable from "./DriverMitraTable";

export const metadata: Metadata = {
  title: "Driver Mitra",
  description: "Halaman Mitra Driver",
};


const breadcrumbItems = [{ title: "Data Mitra", link: "/dashboard/mitra-drivers" }];

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex items-start justify-between">
        <Heading title="Driver Mitra" />
      </div>
      <Separator />
        <DriverMitraTable />
    </div>
  );
}
