import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import VerificationTableWrapper from "./table/detail/verification-table-wrapper";

export const metadata: Metadata = {
  title: "Verifikasi Tambahan | Transgo",
  description: "Halaman verifikasi tambahan",
};

const breadcrumbItems = [{ title: "Verifikasi Tambahan", link: "/dashboard/verifikasi-data" }];

export default function Page() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex items-start justify-between">
        <Heading title="Verifikasi Tambahan" />
      </div>
      <Separator />
      <Tabs defaultValue="needconfirmation" className="space-y-4">
      <TabsContent value="needconfirmation">
        <VerificationTableWrapper />
      </TabsContent>
    </Tabs>

    </div>
  );
}
