"use client";
import BreadCrumb from "@/components/breadcrumb";
import Spinner from "@/components/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetDetailBuser,
  useInvalidateBuserQueries,
  useResolveBusser,
} from "@/hooks/api/useBuser";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import BuserForm from "@/components/forms/buser-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

export default function ReviewPage({
  params,
}: {
  params: { buserId: string };
}) {
  const breadcrumbItems = [
    { title: "Buser", link: "/dashboard/buser" },
    { title: "Tinjau", link: `/dashboard/buser/${params.buserId}/preview` },
  ];

  const { data, isFetching } = useGetDetailBuser(params.buserId);
  const buser = data?.data;
  const invalidateBuserQueries = useInvalidateBuserQueries();
  const resolveBusser = useResolveBusser();
  const { toast } = useToast();

  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [notes, setNotes] = React.useState<string>("");

  const handleAman = async () => {
    if (!notes.trim()) {
      toast({
        variant: "destructive",
        title: "Keterangan Diperlukan",
        description: "Mohon isi keterangan terlebih dahulu",
      });
      return;
    }

    setLoading(true);
    try {
      await resolveBusser(params.buserId, notes);
      // Invalidate all buser queries to refresh the table
      invalidateBuserQueries();
      toast({
        variant: "success",
        title: "Berhasil!",
        description: "Kasus buser berhasil diselesaikan",
      });
      router.back();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Gagal memindahkan ke selesai",
      });
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
          <>
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
            />

            <Separator />

            <div className="space-y-4">
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Keterangan Penyelesaian *
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Masukkan keterangan penyelesaian kasus buser..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleAman}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={loading || !notes.trim()}
                >
                  {loading ? "Memproses..." : "Selesai"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
