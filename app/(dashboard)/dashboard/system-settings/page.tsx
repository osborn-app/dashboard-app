"use client";

import { useState, useEffect } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetSystemSettings,
  useCreateSystemSetting,
  useUpdateSystemSetting,
} from "@/hooks/api/useSystemSettings";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/spinner";
import { Value } from "@radix-ui/react-select";

const breadcrumbItems = [
  { title: "Pengaturan Sistem", link: "/dashboard/system-settings" },
];

const DURATION_KEY = "duration_hours_per_unit";

export default function SystemSettingsPage() {
  const { data: settings, isLoading } = useGetSystemSettings();
  const { mutateAsync: createSetting } = useCreateSystemSetting();
  const { mutateAsync: updateSetting } = useUpdateSystemSetting();

  const [existingId, setExistingId] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log("🔍 Settings data:", settings);
    if (settings && settings.length > 0) {
      const durationSetting = settings.find((s) => s.key === DURATION_KEY);
      console.log("🔍 Found duration setting:", durationSetting);
      if (durationSetting) {
        console.log("✅ Setting values - ID:", durationSetting.id, "Value:", durationSetting.value);
        setExistingId(durationSetting.id);
        setValue(String(durationSetting.value)); // Ensure it's a string
        setDescription(durationSetting.description || "");
      }
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        key: DURATION_KEY,
        value: value.trim(),
        description: description.trim() || "Jumlah jam per 1 unit duration",
        type: "number" as const,
      };

      if (existingId) {
        await updateSetting({
          id: existingId,
          data: {
            value: payload.value,
            description: payload.description,
            type: payload.type,
          },
        });
        toast({
          variant: "success",
          title: "Pengaturan berhasil diperbarui",
        });
      } else {
        const created = await createSetting(payload);
        setExistingId(created.id);
        toast({
          variant: "success",
          title: "Pengaturan berhasil disimpan",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error?.response?.data?.message || error?.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex h-[400px] items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }
  console.log("🔍 Settings data:", value);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex flex-col gap-2">
        <Heading
          title="Pengaturan Sistem"
          description="Konfigurasi durasi rental per unit (12 atau 24 jam)"
        />
      </div>
      <Separator />


      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="duration-value">
                Durasi per Unit (Jam) <span className="text-red-500">*</span>
              </Label>
              <Select
                key={`duration-${value}`}
                value={value}
                onValueChange={(val) => {
                  console.log("📝 Duration changed to:", val);
                  setValue(val);
                }}
                disabled={saving}
              >
                <SelectTrigger id="duration-value">
                  <SelectValue placeholder="Pilih durasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Jam</SelectItem>
                  <SelectItem value="24">24 Jam</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                1 unit rental = {value || "..."} jam. Pilih 12 untuk sistem half-day, atau
                24 untuk sistem full-day.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration-description">
                Deskripsi (Opsional)
              </Label>
              <Textarea
                id="duration-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan singkat tentang setting ini"
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Menyimpan..."
                  : existingId
                  ? "Update Configuration"
                  : "Save Configuration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
