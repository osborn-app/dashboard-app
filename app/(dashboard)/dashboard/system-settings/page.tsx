"use client";

import { useState, useEffect } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetSystemSettings,
  useCreateSystemSetting,
  useUpdateSystemSetting,
} from "@/hooks/api/useSystemSettings";
import {
  useGetDepositSettings,
  useUpdateDepositSettings,
} from "@/hooks/api/useOrder";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/spinner";

const breadcrumbItems = [
  { title: "System Settings", link: "/dashboard/system-settings" },
];

const DURATION_KEY = "duration_hours_per_unit";

export default function SystemSettingsPage() {
  const { data: settings, isLoading: isLoadingSettings } = useGetSystemSettings();
  const { mutateAsync: createSetting } = useCreateSystemSetting();
  const { mutateAsync: updateSetting } = useUpdateSystemSetting();
  
  const { data: depositSettings, isLoading: isLoadingDeposit } = useGetDepositSettings();
  const { mutateAsync: updateDepositSettings } = useUpdateDepositSettings();

  // System Settings state
  const [existingId, setExistingId] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [savingSystem, setSavingSystem] = useState(false);

  // Down Payment Settings state
  const [enabled, setEnabled] = useState(false);
  const [percentage, setPercentage] = useState(25);
  const [savingDownPayment, setSavingDownPayment] = useState(false);

  const isLoading = isLoadingSettings || isLoadingDeposit;

  useEffect(() => {
    if (settings && settings.length > 0) {
      const durationSetting = settings.find((s) => s.key === DURATION_KEY);
      if (durationSetting) {
        setExistingId(durationSetting.id);
        setValue(String(durationSetting.value));
        setDescription(durationSetting.description || "");
      }
    }
  }, [settings]);

  useEffect(() => {
    if (depositSettings) {
      setEnabled(depositSettings.enabled ?? false);
      setPercentage(depositSettings.percentage ?? 25);
    }
  }, [depositSettings]);

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSystem(true);

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
      setSavingSystem(false);
    }
  };

  const handleDownPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDownPayment(true);

    try {
      const payload = {
        enabled,
        percentage: enabled ? percentage : 0,
      };

      await updateDepositSettings(payload);
      toast({
        variant: "success",
        title: "Pengaturan down payment berhasil diperbarui",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error?.response?.data?.message || error?.message,
      });
    } finally {
      setSavingDownPayment(false);
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

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex flex-col gap-2">
        <Heading
          title="System Settings"
          description="Konfigurasi pengaturan sistem dan down payment"
        />
      </div>
      <Separator />

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system">Pengaturan Sistem</TabsTrigger>
          <TabsTrigger value="down-payment">Down Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSystemSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="duration-value">
                    Durasi per Unit (Jam) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    key={`duration-${value}`}
                    value={value}
                    onValueChange={(val) => setValue(val)}
                    disabled={savingSystem}
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
                    disabled={savingSystem}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={savingSystem}>
                    {savingSystem
                      ? "Menyimpan..."
                      : existingId
                      ? "Update Configuration"
                      : "Save Configuration"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="down-payment">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleDownPaymentSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled" className="text-base font-medium">
                      Aktifkan Down Payment
                    </Label>
                    <Switch
                      id="enabled"
                      checked={enabled}
                      onCheckedChange={setEnabled}
                      disabled={savingDownPayment}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aktifkan atau nonaktifkan fitur down payment untuk pesanan
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentage">
                    Persentase Down Payment (%){" "}
                    {enabled && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    placeholder="Masukkan persentase down payment"
                    disabled={!enabled || savingDownPayment}
                    required={enabled}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Masukkan persentase down payment yang akan dikenakan (0-100%)
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={savingDownPayment}>
                    {savingDownPayment ? "Menyimpan..." : "Simpan Pengaturan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
