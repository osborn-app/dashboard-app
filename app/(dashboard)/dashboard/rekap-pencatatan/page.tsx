import BreadCrumb from "@/components/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import RekapPencatatanTableWrapper from "./rekap-pencatatan-table-wrapper";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getOrderanSewa } from "@/client/rekapClient";

export const metadata: Metadata = {
  title: "Rekap Pencatatan | Transgo",
  description: "Rekap Pencatatan page",
};

type paramsProps = {
  searchParams: {
    [key: string]: string | undefined;
  };
};

const breadcrumbItems = [
  { title: "Rekap Pencatatan", link: "/dashboard/rekap-pencatatan" },
];

export default async function page({ searchParams }: paramsProps) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["rekap-pencatatan"],
    queryFn: getOrderanSewa,
  });

  const defaultTab = searchParams.type ?? "orderan-sewa";

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-center justify-between">
          <Heading
            title="Rekap Pencatatan"
            description="Kelola dan lihat data rekap pencatatan untuk berbagai jenis transaksi."
          />
          <Link
            href="/dashboard/rekap-pencatatan/lainnya/create"
            className={cn(buttonVariants())}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Data Lainnya
          </Link>
        </div>
        <Separator />
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <RekapPencatatanTableWrapper />
          </HydrationBoundary>
        </Tabs>
      </div>
    </>
  );
}
