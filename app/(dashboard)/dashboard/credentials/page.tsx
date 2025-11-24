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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import {
  useGetPaperCredentials,
  useCreatePaperCredential,
  useUpdatePaperCredential,
} from "@/hooks/api/usePaperCredentials";
import {
  useGetQontakCredentials,
  useCreateQontakCredential,
  useUpdateQontakCredential,
} from "@/hooks/api/useQontakCredentials";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/spinner";

const breadcrumbItems = [
  { title: "Credentials", link: "/dashboard/credentials" },
];

export default function CredentialsPage() {
  // Paper Credentials
  const { data: paperCredentials, isLoading: isLoadingPaper } = useGetPaperCredentials();
  const { mutateAsync: createPaperCredential } = useCreatePaperCredential();
  const { mutateAsync: updatePaperCredential } = useUpdatePaperCredential();

  // Qontak Credentials
  const { data: qontakCredentials, isLoading: isLoadingQontak } = useGetQontakCredentials();
  const { mutateAsync: createQontakCredential } = useCreateQontakCredential();
  const { mutateAsync: updateQontakCredential } = useUpdateQontakCredential();

  // Paper state
  const [paperExistingId, setPaperExistingId] = useState<number | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [paperDescription, setPaperDescription] = useState("");
  const [savingPaper, setSavingPaper] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);

  // Qontak state
  const [qontakExistingId, setQontakExistingId] = useState<number | null>(null);
  const [token, setToken] = useState("");
  const [qontakDescription, setQontakDescription] = useState("");
  const [savingQontak, setSavingQontak] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const isLoading = isLoadingPaper || isLoadingQontak;

  useEffect(() => {
    if (paperCredentials && paperCredentials.length > 0) {
      const activeCredential =
        paperCredentials.find((c) => c.is_active) || paperCredentials[0];
      if (activeCredential) {
        setPaperExistingId(activeCredential.id);
        setClientId(activeCredential.client_id);
        setClientSecret(activeCredential.client_secret);
        setPaperDescription(activeCredential.description || "");
      }
    }
  }, [paperCredentials]);

  useEffect(() => {
    if (qontakCredentials && qontakCredentials.length > 0) {
      const activeCredential =
        qontakCredentials.find((c) => c.is_active) || qontakCredentials[0];
      if (activeCredential) {
        setQontakExistingId(activeCredential.id);
        setToken(activeCredential.token);
        setQontakDescription(activeCredential.description || "");
      }
    }
  }, [qontakCredentials]);

  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPaper(true);

    try {
      const payload = {
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
        description: paperDescription.trim() || "Paper.id API Credentials",
        is_active: true,
      };

      if (paperExistingId) {
        await updatePaperCredential({
          id: paperExistingId,
          data: payload,
        });
        toast({
          variant: "success",
          title: "Paper.id credentials berhasil diperbarui",
        });
      } else {
        const created = await createPaperCredential(payload);
        setPaperExistingId(created.id);
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
      setSavingPaper(false);
    }
  };

  const handleQontakSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingQontak(true);

    try {
      const payload = {
        token: token.trim(),
        description: qontakDescription.trim() || "Mekari Qontak API Token",
        is_active: true,
      };

      if (qontakExistingId) {
        await updateQontakCredential({
          id: qontakExistingId,
          data: payload,
        });
        toast({
          variant: "success",
          title: "Qontak credentials berhasil diperbarui",
        });
      } else {
        const created = await createQontakCredential(payload);
        setQontakExistingId(created.id);
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
      setSavingQontak(false);
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
          title="Credentials"
          description="Konfigurasi API credentials untuk integrasi payment gateway dan WhatsApp"
        />
      </div>
      <Separator />

      <Tabs defaultValue="paper" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paper">Paper.id</TabsTrigger>
          <TabsTrigger value="qontak">Qontak</TabsTrigger>
        </TabsList>

        <TabsContent value="paper">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handlePaperSubmit} className="space-y-6">
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
                      disabled={savingPaper}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowClientId(!showClientId)}
                      disabled={savingPaper}
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
                      disabled={savingPaper}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowClientSecret(!showClientSecret)}
                      disabled={savingPaper}
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
                  <Label htmlFor="paper-description">Deskripsi (Opsional)</Label>
                  <Textarea
                    id="paper-description"
                    value={paperDescription}
                    onChange={(e) => setPaperDescription(e.target.value)}
                    placeholder="Catatan atau keterangan tambahan"
                    rows={3}
                    disabled={savingPaper}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={savingPaper}>
                    {savingPaper
                      ? "Menyimpan..."
                      : paperExistingId
                      ? "Update Configuration"
                      : "Save Configuration"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qontak">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleQontakSubmit} className="space-y-6">
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
                      disabled={savingQontak}
                      className="flex-1 font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowToken(!showToken)}
                      disabled={savingQontak}
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
                  <Label htmlFor="qontak-description">Deskripsi (Opsional)</Label>
                  <Textarea
                    id="qontak-description"
                    value={qontakDescription}
                    onChange={(e) => setQontakDescription(e.target.value)}
                    placeholder="Catatan atau keterangan tambahan"
                    rows={3}
                    disabled={savingQontak}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={savingQontak}>
                    {savingQontak
                      ? "Menyimpan..."
                      : qontakExistingId
                      ? "Update Configuration"
                      : "Save Configuration"}
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

