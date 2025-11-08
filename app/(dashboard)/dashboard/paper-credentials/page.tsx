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
  useGetPaperCredentials,
  useCreatePaperCredential,
  useUpdatePaperCredential,
} from "@/hooks/api/usePaperCredentials";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/spinner";

const breadcrumbItems = [
  { title: "Paper.id Credentials", link: "/dashboard/paper-credentials" },
];

export default function PaperCredentialsPage() {
  const { data: credentials, isLoading } = useGetPaperCredentials();
  const { mutateAsync: createCredential } = useCreatePaperCredential();
  const { mutateAsync: updateCredential } = useUpdatePaperCredential();

  const [existingId, setExistingId] = useState<number | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);

  useEffect(() => {
    if (credentials && credentials.length > 0) {
      // Get the active credential or the first one
      const activeCredential =
        credentials.find((c) => c.is_active) || credentials[0];
      if (activeCredential) {
        setExistingId(activeCredential.id);
        setClientId(activeCredential.client_id);
        setClientSecret(activeCredential.client_secret);
        setDescription(activeCredential.description || "");
      }
    }
  }, [credentials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
        description: description.trim() || "Paper.id API Credentials",
        is_active: true,
      };

      if (existingId) {
        await updateCredential({
          id: existingId,
          data: payload,
        });
        toast({
          variant: "success",
          title: "Paper.id credentials berhasil diperbarui",
        });
      } else {
        const created = await createCredential(payload);
        setExistingId(created.id);
        toast({
          variant: "success",
          title: "Paper.id credentials berhasil disimpan",
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
          title="Paper.id Credentials"
          description="Konfigurasi API credentials untuk integrasi Paper.id payment gateway"
        />
      </div>
      <Separator />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="client-id">
                Client ID <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="client-id"
                  type={showClientId ? "text" : "password"}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Masukkan Paper.id Client ID"
                  required
                  disabled={saving}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowClientId(!showClientId)}
                  disabled={saving}
                >
                  {showClientId ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-secret">
                Client Secret <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="client-secret"
                  type={showClientSecret ? "text" : "password"}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Masukkan Paper.id Client Secret"
                  required
                  disabled={saving}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                  disabled={saving}
                >
                  {showClientSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
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
