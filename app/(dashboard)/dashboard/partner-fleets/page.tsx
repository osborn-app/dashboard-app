import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import DriverMitraTable from "./PartnerMitraTable";

export const metadata: Metadata = {
  title: "Partnet Mitra Fleet",
  description: "Halaman Partnet Driver Fleet",
};


const breadcrumbItems = [{ title: "Data Mitra", link: "/dashboard/partnet-fleetsw" }];

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex items-start justify-between">
        <Heading title="Partner Fleet Mitra" />
      </div>
      <Separator />
        <DriverMitraTable />
    </div>
  );
}
