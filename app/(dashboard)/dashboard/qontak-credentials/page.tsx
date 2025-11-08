"use client";

import { useState, useEffect } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import {
  useGetQontakCredentials,
  useCreateQontakCredential,
  useUpdateQontakCredential,
} from "@/hooks/api/useQontakCredentials";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/spinner";

const breadcrumbItems = [
  { title: "Qontak Credentials", link: "/dashboard/qontak-credentials" },
];

export default function QontakCredentialsPage() {
  const { data: credentials, isLoading } = useGetQontakCredentials();
  const { mutateAsync: createCredential } = useCreateQontakCredential();
  const { mutateAsync: updateCredential } = useUpdateQontakCredential();

  const [existingId, setExistingId] = useState<number | null>(null);
  const [token, setToken] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (credentials && credentials.length > 0) {
      // Get the active credential or the first one
      const activeCredential =
        credentials.find((c) => c.is_active) || credentials[0];
      if (activeCredential) {
        setExistingId(activeCredential.id);
        setToken(activeCredential.token);
        setDescription(activeCredential.description || "");
      }
    }
  }, [credentials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        token: token.trim(),
        description: description.trim() || "Mekari Qontak API Token",
        is_active: true,
      };

      if (existingId) {
        await updateCredential({
          id: existingId,
          data: payload,
        });
        toast({
          variant: "success",
          title: "Qontak credentials berhasil diperbarui",
        });
      } else {
        const created = await createCredential(payload);
        setExistingId(created.id);
        toast({
          variant: "success",
          title: "Qontak credentials berhasil disimpan",
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

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex flex-col gap-2">
        <Heading
          title="Qontak Credentials"
          description="Konfigurasi API token untuk integrasi Mekari Qontak WhatsApp API"
        />
      </div>
      <Separator />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token">
                API Token <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="token"
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Masukkan Qontak API Token"
                  required
                  disabled={saving}
                  className="flex-1 font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowToken(!showToken)}
                  disabled={saving}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Token API dapat diperoleh dari dashboard Mekari Qontak di bagian Integration Settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Catatan atau keterangan tambahan"
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
