"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import {
  useCreateInspection,
  useGetAvailableFleets,
} from "@/hooks/api/useInspections";

const formSchema = z.object({
  fleet_id: z.string().min(1, "Fleet harus dipilih"),
  inspector_name: z.string().min(1, "Nama inspector harus diisi"),
  kilometer: z.string().min(1, "Kilometer harus diisi"),
  oil_status: z.enum(["aman", "tidak_aman"]),
  tire_status: z.enum(["aman", "tidak_aman"]),
  battery_status: z.enum(["aman", "tidak_aman"]),
  description: z.string().min(1, "Deskripsi harus diisi"),
  repair_duration_days: z.string().optional(),
});

export default function InspectionsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fleetId = searchParams.get("fleet_id");

  const [fleetType, setFleetType] = useState<string>("car");
  const createInspection = useCreateInspection();
  const { data: availableFleets, isLoading: loadingFleets } =
    useGetAvailableFleets(fleetType);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fleet_id: fleetId || "",
      inspector_name: "",
      kilometer: "",
      oil_status: "aman",
      tire_status: "aman",
      battery_status: "aman",
      description: "",
      repair_duration_days: "",
    },
  });

  useEffect(() => {
    if (fleetId) {
      form.setValue("fleet_id", fleetId);
    }
  }, [fleetId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createInspection.mutateAsync({
        ...values,
        kilometer: parseInt(values.kilometer),
        repair_duration_days: values.repair_duration_days
          ? parseInt(values.repair_duration_days)
          : undefined,
      });

      toast({
        title: "Success",
        description: "Inspeksi berhasil dibuat",
      });

      router.push("/dashboard/inspections");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal membuat inspeksi",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Fleet Type Selection */}
          <FormField
            control={form.control}
            name="fleet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Fleet</FormLabel>
                <Select
                  value={fleetType}
                  onValueChange={(value) => {
                    setFleetType(value);
                    form.setValue("fleet_id", "");
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe fleet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="car">Mobil</SelectItem>
                    <SelectItem value="motorcycle">Motor</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Pilih tipe fleet untuk melihat daftar yang tersedia
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Fleet Selection */}
          <FormField
            control={form.control}
            name="fleet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fleet</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loadingFleets}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih fleet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableFleets?.data?.map((fleet: any) => (
                      <SelectItem key={fleet.id} value={fleet.id.toString()}>
                        {fleet.name} - {fleet.plate_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Inspector Name */}
          <FormField
            control={form.control}
            name="inspector_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Inspector</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama inspector" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Kilometer */}
          <FormField
            control={form.control}
            name="kilometer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilometer</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Masukkan kilometer"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Component Statuses */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="oil_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Oli</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aman">Aman</SelectItem>
                      <SelectItem value="tidak_aman">Tidak Aman</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tire_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Ban</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aman">Aman</SelectItem>
                      <SelectItem value="tidak_aman">Tidak Aman</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="battery_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Aki</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aman">Aman</SelectItem>
                      <SelectItem value="tidak_aman">Tidak Aman</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Masukkan deskripsi inspeksi"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Repair Duration Days */}
          <FormField
            control={form.control}
            name="repair_duration_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durasi Perbaikan (Hari)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Masukkan durasi perbaikan (opsional)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Kosongkan jika tidak ada perbaikan yang diperlukan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={createInspection.isPending}>
              {createInspection.isPending ? "Menyimpan..." : "Simpan Inspeksi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/inspections")}
            >
              Batal
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
