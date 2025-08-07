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
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import MulitpleImageUpload, {
  MulitpleImageUploadResponse,
} from "@/components/multiple-image-upload";
import useAxiosAuth from "@/hooks/axios/use-axios-auth";
import axios from "axios";

// File schema for photo upload
const fileSchema = z.custom<any>(
  (val: any) => {
    if (!val || val.length == 0) return true; // Allow empty for optional
    for (let i = 0; i < val.length; i++) {
      const file = val[i];
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) return false;
    }
    return true;
  },
  {
    message: "Pastikan file yang kamu pilih adalah tipe JPEG, PNG.",
  },
);

const formSchema = z.object({
  fleet_id: z.string().min(1, "Fleet harus dipilih"),
  inspector_name: z.string().min(1, "Nama inspector harus diisi"),
  kilometer: z
    .string()
    .min(1, "Kilometer harus diisi")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Kilometer harus berupa angka positif",
    }),
  oil_status: z.enum(["aman", "tidak_aman"]),
  tire_status: z.enum(["aman", "tidak_aman"]),
  battery_status: z.enum(["aman", "tidak_aman"]),
  description: z.string().min(1, "Deskripsi harus diisi"),

  repair_completion_date: z
    .string()
    .min(1, "Tanggal selesai perbaikan harus diisi"),
  repair_photo_url: fileSchema.refine((val) => val && val.length > 0, {
    message: "Foto perbaikan harus diupload",
  }),
  repair_duration_days: z
    .number()
    .min(1, "Durasi perbaikan harus diisi")
    .max(7, "Durasi perbaikan maksimal 7 hari"),
});

type InspectionsFormValues = z.infer<typeof formSchema> & {
  repair_photo_url: MulitpleImageUploadResponse;
};

interface InspectionsFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function InspectionsForm({
  initialData,
  isEdit,
}: InspectionsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fleetId = searchParams.get("fleet_id");

  const [fleetType, setFleetType] = useState<string>("car");
  const [loading, setLoading] = useState(false);
  const createInspection = useCreateInspection();
  const { data: availableFleets, isLoading: loadingFleets } =
    useGetAvailableFleets(fleetType);
  const axiosAuth = useAxiosAuth();

  const uploadImage = async (file: any) => {
    const file_names = [];
    for (let i = 0; i < file?.length; i++) {
      // Handle both File objects and objects with .file property
      const fileObj = file[i];
      const fileName =
        fileObj instanceof File ? fileObj.name : fileObj.file?.name;
      file_names.push(fileName);
    }

    const response = await axiosAuth.post("/storages/presign/list", {
      file_names: file_names,
      folder: "fleet",
    });

    for (let i = 0; i < file_names.length; i++) {
      const fileObj = file[i];
      const fileToUpload = fileObj instanceof File ? fileObj : fileObj.file;
      await axios.put(response.data[i].upload_url, fileToUpload, {
        headers: {
          "Content-Type": fileToUpload.type,
        },
      });
    }

    return response.data;
  };

  const form = useForm<InspectionsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fleet_id:
        initialData?.fleet?.id?.toString() ||
        initialData?.fleet_id ||
        fleetId ||
        "",
      inspector_name: initialData?.inspector_name || "",
      kilometer: initialData?.kilometer?.toString() || "",
      oil_status: initialData?.oil_status || "aman",
      tire_status: initialData?.tire_status || "aman",
      battery_status: initialData?.battery_status || "aman",
      description: initialData?.description || "",
      repair_completion_date: initialData?.repair_completion_date || "",
      repair_photo_url: initialData?.repair_photo_url || [],
      repair_duration_days: initialData?.repair_duration_days || 0,
    },
  });

  useEffect(() => {
    if (fleetId) {
      form.setValue("fleet_id", fleetId);
      // Set fleet type based on the selected fleet
      if (availableFleets?.data) {
        const fleet = availableFleets.data.find(
          (f: any) => f.id.toString() === fleetId,
        );
        if (fleet) {
          setFleetType(fleet.type || "car");
        }
      }
    }
  }, [fleetId, form, availableFleets]);

  // Auto-set fleet type if fleet_id is provided
  useEffect(() => {
    if (fleetId && !isEdit) {
      // Try to determine fleet type from available fleets
      if (availableFleets?.data) {
        const fleet = availableFleets.data.find(
          (f: any) => f.id.toString() === fleetId,
        );
        if (fleet) {
          setFleetType(fleet.type || "car");
        }
      }
    }
  }, [fleetId, availableFleets, isEdit]);

  // Validate initialData structure
  if (isEdit && !initialData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Data inspeksi tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: InspectionsFormValues) => {
    setLoading(true);

    try {
      let repairPhotoUrls: string[] = [];
      if (values.repair_photo_url && values.repair_photo_url.length > 0) {
        try {
          const uploadImageRes = await uploadImage(values.repair_photo_url);
          repairPhotoUrls = uploadImageRes.map(
            (item: { download_url: string; upload_url: string }) =>
              item.download_url,
          );
        } catch (error) {
          console.error("Upload error:", error);
          throw error;
        }
      }

      const payload = {
        fleet_id: parseInt(values.fleet_id),
        inspector_name: values.inspector_name,
        kilometer: parseInt(values.kilometer),
        oil_status: values.oil_status,
        tire_status: values.tire_status,
        battery_status: values.battery_status,
        description: values.description,
        has_issue:
          values.oil_status === "tidak_aman" ||
          values.tire_status === "tidak_aman" ||
          values.battery_status === "tidak_aman",
        repair_photo_url: repairPhotoUrls[0],
        repair_duration_days: values.repair_duration_days,
        repair_completion_date: new Date(
          values.repair_completion_date,
        ).toISOString(),
      };

      await createInspection.mutateAsync(payload);

      toast({
        title: "Success",
        description: "Inspeksi berhasil dibuat",
      });

      router.push("/dashboard/inspections");
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal membuat inspeksi: ${
          error?.response?.data?.message || error?.message
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={isEdit ? "Detail Inspeksi" : "Tambah Inspeksi"}
          description={
            isEdit
              ? "Informasi lengkap inspeksi kendaraan"
              : "Buat inspeksi baru"
          }
        />
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          {/* Fleet Type Selection - Only show if no fleet_id provided */}
          {!fleetId && !isEdit && (
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
                    disabled={isEdit}
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
          )}

          {/* Fleet Selection */}
          <FormField
            control={form.control}
            name="fleet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fleet</FormLabel>
                {fleetId ? (
                  // Show selected fleet info when fleet_id is provided
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-green-50">
                      <div className="flex-1">
                        {availableFleets?.data ? (
                          (() => {
                            const fleet = availableFleets.data.find(
                              (f: any) => f.id.toString() === fleetId,
                            );
                            return fleet ? (
                              <div>
                                <p className="font-medium text-green-800">
                                  {fleet.name} - {fleet.plate_number}
                                </p>
                                <p className="text-sm text-green-600">
                                  Type: {fleet.type}
                                </p>
                              </div>
                            ) : (
                              <p className="text-green-800">
                                Fleet ID: {fleetId}
                              </p>
                            );
                          })()
                        ) : (
                          <p className="text-green-800">
                            Loading fleet data...
                          </p>
                        )}
                      </div>
                    </div>
                    <FormDescription className="text-green-600">
                      Fleet telah dipilih otomatis dari table Tersedia
                    </FormDescription>
                  </div>
                ) : (
                  // Show fleet selection dropdown when no fleet_id
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingFleets || isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih fleet">
                          {isEdit &&
                          initialData?.fleet?.name &&
                          initialData?.fleet?.plate_number
                            ? `${initialData.fleet.name} - ${initialData.fleet.plate_number}`
                            : isEdit && initialData?.fleet_id
                            ? `Fleet ID: ${initialData.fleet_id}`
                            : undefined}
                        </SelectValue>
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
                )}
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
                  <Input
                    placeholder="Masukkan nama inspector"
                    {...field}
                    readOnly={isEdit || loading}
                  />
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
                    readOnly={isEdit || loading}
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
                    disabled={isEdit || loading}
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
                    disabled={isEdit || loading}
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
                    disabled={isEdit || loading}
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
                    readOnly={isEdit || loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Repair Duration */}
          <FormField
            control={form.control}
            name="repair_duration_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimasi Durasi Perbaikan</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                  disabled={isEdit || loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih durasi perbaikan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 Hari</SelectItem>
                    <SelectItem value="2">2 Hari</SelectItem>
                    <SelectItem value="3">3 Hari</SelectItem>
                    <SelectItem value="4">4 Hari</SelectItem>
                    <SelectItem value="5">5 Hari</SelectItem>
                    <SelectItem value="6">6 Hari</SelectItem>
                    <SelectItem value="7">7 Hari</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Pilih estimasi durasi perbaikan jika ada komponen yang tidak
                  aman
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEdit && (
            <div className="flex gap-4">
              <Button type="submit" disabled={createInspection.isPending}>
                {createInspection.isPending
                  ? "Menyimpan..."
                  : "Simpan Inspeksi"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/inspections")}
              >
                Batal
              </Button>
            </div>
          )}
        </form>
      </Form>
    </>
  );
}
