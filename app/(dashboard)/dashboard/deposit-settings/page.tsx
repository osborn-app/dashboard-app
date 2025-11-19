"use client";

import { useState, useEffect } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  useGetDepositSettings,
  useUpdateDepositSettings,
} from "@/hooks/api/useOrder";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/spinner";

const breadcrumbItems = [
  { title: "Deposit Settings", link: "/dashboard/deposit-settings" },
];

export default function DepositSettingsPage() {
  const { data: depositSettings, isLoading } = useGetDepositSettings();
  const { mutateAsync: updateDepositSettings } = useUpdateDepositSettings();

  const [enabled, setEnabled] = useState(false);
  const [percentage, setPercentage] = useState(25);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (depositSettings) {
      setEnabled(depositSettings.enabled ?? false);
      setPercentage(depositSettings.percentage ?? 25);
    }
  }, [depositSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        enabled,
        percentage: enabled ? percentage : 0,
      };

      await updateDepositSettings(payload);
      toast({
        variant: "success",
        title: "Deposit settings berhasil diperbarui",
      });
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

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex flex-col gap-2">
        <Heading
          title="Deposit Settings"
          description="Konfigurasi pengaturan deposit untuk pesanan"
        />
      </div>
      <Separator />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled" className="text-base font-medium">
                  Aktifkan Deposit
                </Label>
                <Switch
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                  disabled={saving}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Aktifkan atau nonaktifkan fitur deposit untuk pesanan
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentage">
                Persentase Deposit (%){" "}
                {enabled && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                placeholder="Masukkan persentase deposit"
                disabled={!enabled || saving}
                required={enabled}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Masukkan persentase deposit yang akan dikenakan (0-100%)
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

