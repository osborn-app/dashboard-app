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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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

// Helper function to convert minutes to time string
const getTimeStringFromMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

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

const formSchema = z
  .object({
    fleet_id: z.string().min(1, "Fleet harus dipilih"),
    inspector_name: z.string().min(1, "Nama inspector harus diisi"),
    kilometer: z
      .string()
      .min(1, "Kilometer harus diisi")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Kilometer harus berupa angka positif",
      }),
    has_issue: z.boolean().optional(),
    oil_status: z.enum(["aman", "tidak_aman"]).optional(),
    tire_status: z.enum(["aman", "tidak_aman"]).optional(),
    battery_status: z.enum(["aman", "tidak_aman"]).optional(),
    description: z.string().optional(),
    repair_duration_days: z
      .number()
      .min(0, "Durasi hari minimal 0")
      .max(7, "Durasi hari maksimal 7")
      .optional(),
    repair_duration_minutes: z
      .number()
      .min(0, "Durasi menit minimal 0")
      .optional(),

    repair_completion_date: z.string().optional(),
    repair_photo_url: fileSchema.optional(),
  })
  .refine(
    (data) => {
      // Check if there are any issues
      const hasIssue =
        data.oil_status === "tidak_aman" ||
        data.tire_status === "tidak_aman" ||
        data.battery_status === "tidak_aman";

      // If there are issues, all issue-related fields are required
      if (hasIssue) {
        if (
          !data.oil_status ||
          !data.tire_status ||
          !data.battery_status ||
          !data.description
        ) {
          return false;
        }
      }

      return true;
    },
    {
      message:
        "Jika ada komponen yang tidak aman, semua field status dan deskripsi harus diisi",
      path: ["description"], // This will show the error on the description field
    },
  );

type InspectionsFormValues = z.infer<typeof formSchema>;

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
  const [hasIssue, setHasIssue] = useState(false);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const createInspection = useCreateInspection();
  const { data: availableFleetsResponse, isLoading: loadingFleets } =
    useGetAvailableFleets();

  // Extract fleets data from response
  const availableFleets = availableFleetsResponse?.data?.data || [];

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
      has_issue: initialData?.has_issue || false,
      oil_status: initialData?.oil_status || "aman",
      tire_status: initialData?.tire_status || "aman",
      battery_status: initialData?.battery_status || "aman",
      description: initialData?.description || "",
      repair_completion_date: initialData?.repair_completion_date || "",
      repair_duration_days: initialData?.repair_duration_days || 0,
      repair_duration_minutes: initialData?.repair_duration_minutes || 0,
    },
  });

  // Initialize hasIssue state based on form values
  useEffect(() => {
    const values = form.getValues();
    const hasIssueValue =
      values.oil_status === "tidak_aman" ||
      values.tire_status === "tidak_aman" ||
      values.battery_status === "tidak_aman";
    setHasIssue(hasIssueValue);
  }, [form]);

  // Initialize duration state from initialData
  useEffect(() => {
    if (initialData) {
      const totalMinutes =
        initialData.repair_duration_days * 24 * 60 +
        (initialData.repair_duration_minutes || 0);
      setDurationHours(Math.floor(totalMinutes / 60));
      setDurationMinutes(totalMinutes % 60);
    }
  }, [initialData]);

  useEffect(() => {
    if (fleetId) {
      form.setValue("fleet_id", fleetId);
    }
  }, [fleetId, form]);

  // Auto-set fleet type if fleet_id is provided
  useEffect(() => {
    if (fleetId && !isEdit && availableFleets && availableFleets.length > 0) {
      const fleet = availableFleets.find(
        (f: { id: number | string }) => f.id.toString() === fleetId,
      );
      if (fleet) {
        setFleetType(fleet.type || "car");
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
      // Check if there are any issues
      const hasIssue =
        values.oil_status === "tidak_aman" ||
        values.tire_status === "tidak_aman" ||
        values.battery_status === "tidak_aman";

      const payload: any = {
        fleet_id: parseInt(values.fleet_id),
        inspector_name: values.inspector_name,
        kilometer: parseInt(values.kilometer),
        has_issue: hasIssue,
      };

      // Only include issue-related fields if there are issues
      if (hasIssue) {
        payload.oil_status = values.oil_status;
        payload.tire_status = values.tire_status;
        payload.battery_status = values.battery_status;
        payload.description = values.description;

        // Add repair duration if it has value
        if (values.repair_duration_days !== undefined) {
          payload.repair_duration_days = values.repair_duration_days;
        }
        if (values.repair_duration_minutes !== undefined) {
          payload.repair_duration_minutes = values.repair_duration_minutes;
        }
      }

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
                        {loadingFleets ? (
                          <div>
                            <p className="text-green-800">
                              Loading fleet data...
                            </p>
                            <p className="text-sm text-green-600">
                              Memuat informasi fleet
                            </p>
                          </div>
                        ) : availableFleets && availableFleets.length > 0 ? (
                          (() => {
                            const fleet = availableFleets.find(
                              (f: { id: number | string }) =>
                                f.id.toString() === fleetId,
                            );
                            return fleet ? (
                              <div>
                                <p className="font-medium text-green-800">
                                  {fleet.name} - {fleet.plate_number}
                                </p>
                                <p className="text-sm text-green-600">
                                  Type:{" "}
                                  {fleet.type === "car" ? "Mobil" : "Motor"}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-green-800">
                                  Fleet ID: {fleetId}
                                </p>
                                <p className="text-sm text-green-600">
                                  Fleet tidak ditemukan dalam daftar tersedia
                                </p>
                              </div>
                            );
                          })()
                        ) : (
                          <div>
                            <p className="font-medium text-green-800">
                              Fleet ID: {fleetId}
                            </p>
                            <p className="text-sm text-green-600">
                              Fleet telah dipilih
                            </p>
                          </div>
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
                      {loadingFleets ? (
                        <SelectItem value="" disabled>
                          Loading fleets...
                        </SelectItem>
                      ) : availableFleets && availableFleets.length > 0 ? (
                        availableFleets.map(
                          (fleet: {
                            id: number | string;
                            name: string;
                            plate_number: string;
                          }) => (
                            <SelectItem
                              key={fleet.id}
                              value={fleet.id.toString()}
                            >
                              {fleet.name} - {fleet.plate_number}
                            </SelectItem>
                          ),
                        )
                      ) : (
                        <SelectItem value="" disabled>
                          Tidak ada fleet tersedia
                        </SelectItem>
                      )}
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

          {/* Has Issue Checkbox */}
          <FormField
            control={form.control}
            name="has_issue"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={hasIssue}
                    onCheckedChange={(checked) => {
                      setHasIssue(checked as boolean);
                      if (!checked) {
                        // Reset issue-related fields when unchecking
                        form.setValue("oil_status", "aman");
                        form.setValue("tire_status", "aman");
                        form.setValue("battery_status", "aman");
                        form.setValue("description", "");
                        form.setValue("repair_duration_days", undefined);
                      }
                    }}
                    disabled={isEdit || loading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Ada kendala/masalah</FormLabel>
                  <FormDescription>
                    Centang jika ditemukan masalah pada kendaraan
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Component Statuses - Only show if hasIssue is true */}
          {hasIssue && (
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
          )}

          {/* Description - Only show if hasIssue is true */}
          {hasIssue && (
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Masalah</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi masalah yang ditemukan"
                      className="min-h-[100px]"
                      {...field}
                      readOnly={isEdit || loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Repair Duration - Only show if hasIssue is true */}
          {hasIssue && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="repair_duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimasi Durasi Perbaikan</FormLabel>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Hari:</Label>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="7"
                            value={field.value || 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            className="w-20"
                            disabled={isEdit || loading}
                          />
                        </FormControl>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Jam:</Label>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={durationHours}
                            onChange={(e) => {
                              const hours = parseInt(e.target.value) || 0;
                              setDurationHours(hours);
                              const totalMinutes = hours * 60 + durationMinutes;
                              form.setValue(
                                "repair_duration_minutes",
                                totalMinutes,
                              );
                            }}
                            className="w-16"
                            disabled={isEdit || loading}
                          />
                        </FormControl>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Menit:</Label>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={durationMinutes}
                            onChange={(e) => {
                              const minutes = parseInt(e.target.value) || 0;
                              setDurationMinutes(minutes);
                              const totalMinutes = durationHours * 60 + minutes;
                              form.setValue(
                                "repair_duration_minutes",
                                totalMinutes,
                              );
                            }}
                            className="w-16"
                            disabled={isEdit || loading}
                          />
                        </FormControl>
                      </div>
                    </div>
                    <FormDescription>
                      Maksimal 7 hari, minimal 0 hari. Jam: 0-23, Menit: 0-59
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

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
