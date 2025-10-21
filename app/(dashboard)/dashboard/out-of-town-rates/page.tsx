import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import OutOfTownRatesTableWrapper from "./ootr-table-wrapper";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getOutOfTownRates } from "@/client/outOfTownRatesClient";

export const metadata: Metadata = {
  title: "Tarif Luar Kota | Transgo",
  description: "Kelola tarif luar kota",
};

type paramsProps = {
  searchParams: {
    [key: string]: string | undefined;
  };
};

const breadcrumbItems = [{ title: "Tarif Luar Kota", link: "/dashboard/out-of-town-rates" }];

export default async function page({ searchParams }: paramsProps) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["out-of-town-rates"],
    queryFn: () => getOutOfTownRates(),
  });

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading title="Tarif Luar Kota" />
        </div>
        <Separator />
        <div className="space-y-4">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <OutOfTownRatesTableWrapper />
          </HydrationBoundary>
        </div>
      </div>
    </>
  );
}
