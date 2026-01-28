"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegisterUser } from "@/hooks/api/useUser";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import Spinner from "@/components/spinner";

interface UserCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserCreateDialog: React.FC<UserCreateDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { mutateAsync: registerUser } = useRegisterUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(formData);
      toast({
        variant: "success",
        title: "User berhasil dibuat!",
      });
      setFormData({
        name: "",
        email: "",
        role: "",
        phone_number: "",
        password: "",
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oops! Ada error.",
        description: error?.response?.data?.message || "Gagal membuat user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buat User Baru</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk membuat user baru
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Masukkan nama"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="Masukkan email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Nomor Telepon *</Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              required
              placeholder="Masukkan nomor telepon"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operation">Operation</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              placeholder="Masukkan password"
              minLength={8}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : "Buat User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
