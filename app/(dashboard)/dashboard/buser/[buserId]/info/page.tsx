"use client";
import BreadCrumb from "@/components/breadcrumb";
import Spinner from "@/components/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetDetailBuser } from "@/hooks/api/useBuser";
import React from "react";
import BuserForm from "@/components/forms/buser-form";
import { resolveBusser } from "@/client/busserClient";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function InfoPage({ params }: { params: { buserId: string } }) {
  const breadcrumbItems = [
    { title: "Buser", link: "/dashboard/buser" },
    { title: "Informasi", link: `/dashboard/buser/${params.buserId}/info` },
  ];

  const { data, isFetching } = useGetDetailBuser(params.buserId);
  const buser = data?.data;

  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleSelesai = async () => {
    setLoading(true);
    try {
      await resolveBusser(params.buserId);
      router.push("/dashboard/buser?status=selesai&page=1&limit=10&q=");
    } catch (e) {
      alert("Gagal memindahkan ke selesai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {isFetching && <Spinner />}
        {!isFetching && buser && (
          <BuserForm
            initialData={{
              ...buser,
              name: buser.order?.customer?.name ?? buser.name ?? "-",
              phone_number:
                buser.order?.customer?.phone_number ??
                buser.phone_number ??
                "-",
              emergency_number:
                buser.order?.customer?.emergency_number ??
                buser.emergency_number ??
                "-",
              email: buser.order?.customer?.email ?? buser.email ?? "-",
              id_photo:
                buser.id_photo ||
                buser.order?.customer?.id_photo ||
                (Array.isArray(buser.order?.customer?.id_cards) &&
                  buser.order.customer.id_cards[0]?.photo) ||
                "",
              total_payment:
                buser.order?.total_price ?? buser.total_payment ?? "-",
              vehicle_type:
                buser.order?.fleet?.vehicle_type ?? buser.vehicle_type ?? "-",
              notes: buser.order?.description ?? buser.notes ?? "-",
            }}
          >
            {buser.status !== "selesai" && (
              <Button
                onClick={handleSelesai}
                className="bg-green-500 hover:bg-green-600 text-white"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Selesai"}
              </Button>
            )}
          </BuserForm>
        )}
      </div>
    </ScrollArea>
  );
}
