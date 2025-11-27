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
const WEB_APP_COLORS_KEY = "web_app_colors";

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

  // Web App Colors state
  const [colorSettingsId, setColorSettingsId] = useState<number | null>(null);
  const [mainColor, setMainColor] = useState("#1F61D9");
  const [primaryColor, setPrimaryColor] = useState("240 5.9% 10%");
  const [primaryForeground, setPrimaryForeground] = useState("0 0% 98%");
  const [savingColors, setSavingColors] = useState(false);

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

  useEffect(() => {
    if (settings && settings.length > 0) {
      const colorSetting = settings.find((s) => s.key === WEB_APP_COLORS_KEY);
      if (colorSetting) {
        setColorSettingsId(colorSetting.id);
        try {
          const colors = JSON.parse(colorSetting.value);
          setMainColor(colors.main || "#1F61D9");
          setPrimaryColor(colors.primary || "240 5.9% 10%");
          setPrimaryForeground(colors.primaryForeground || "0 0% 98%");
        } catch (e) {
          console.error("Failed to parse color settings:", e);
        }
      }
    }
  }, [settings]);

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

  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingColors(true);

    try {
      const colorData = {
        main: mainColor,
        primary: primaryColor,
        primaryForeground: primaryForeground,
      };

      const payload = {
        key: WEB_APP_COLORS_KEY,
        value: JSON.stringify(colorData),
        description: "Warna tema untuk web app",
        type: "json" as const,
      };

      if (colorSettingsId) {
        await updateSetting({
          id: colorSettingsId,
          data: {
            value: payload.value,
            description: payload.description,
            type: payload.type,
          },
        });
        toast({
          variant: "success",
          title: "Warna web app berhasil diperbarui",
          description: "Perubahan akan terlihat di web app setelah refresh",
        });
      } else {
        const created = await createSetting(payload);
        setColorSettingsId(created.id);
        toast({
          variant: "success",
          title: "Warna web app berhasil disimpan",
          description: "Perubahan akan terlihat di web app setelah refresh",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error?.response?.data?.message || error?.message,
      });
    } finally {
      setSavingColors(false);
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system">Pengaturan Sistem</TabsTrigger>
          <TabsTrigger value="down-payment">Down Payment</TabsTrigger>
          <TabsTrigger value="web-colors">Warna Web App</TabsTrigger>
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

        <TabsContent value="web-colors">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleColorSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="main-color">
                      Warna Utama (Main Color) <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="main-color"
                        type="color"
                        value={mainColor}
                        onChange={(e) => setMainColor(e.target.value)}
                        disabled={savingColors}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={mainColor}
                        onChange={(e) => setMainColor(e.target.value)}
                        placeholder="#1F61D9"
                        disabled={savingColors}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Warna utama yang digunakan di web app (contoh: tombol, link, accent)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-color">
                      Primary Color (HSL) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="primary-color"
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="240 5.9% 10%"
                      disabled={savingColors}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Primary color dalam format HSL (Hue Saturation% Lightness%)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-foreground">
                      Primary Foreground (HSL) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="primary-foreground"
                      type="text"
                      value={primaryForeground}
                      onChange={(e) => setPrimaryForeground(e.target.value)}
                      placeholder="0 0% 98%"
                      disabled={savingColors}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Warna teks untuk primary color dalam format HSL
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <div className="flex gap-4 items-center">
                      <div
                        className="w-20 h-20 rounded-lg border-2"
                        style={{ backgroundColor: mainColor }}
                      />
                      <div className="space-y-1">
                        <div
                          className="px-4 py-2 rounded text-sm font-medium"
                          style={{
                            backgroundColor: `hsl(${primaryColor})`,
                            color: `hsl(${primaryForeground})`,
                          }}
                        >
                          Primary Button
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={savingColors}>
                    {savingColors ? "Menyimpan..." : "Simpan Warna"}
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
