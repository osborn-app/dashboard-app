"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetUserById } from "@/hooks/api/useUser";
import Spinner from "@/components/spinner";

interface UserDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | number;
}

export const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const { data: userData, isLoading } = useGetUserById(userId, {
    enabled: isOpen && !!userId,
  });

  const user = userData?.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail User</DialogTitle>
          <DialogDescription>Informasi lengkap user</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : user ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama</label>
                <p className="text-sm font-semibold">{user.name || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm font-semibold">{user.email || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nomor Telepon</label>
                <p className="text-sm font-semibold">{user.phone_number || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-sm font-semibold">
                  {user.role === "operation"
                    ? "Operation"
                    : user.role === "admin"
                    ? "Admin"
                    : user.role === "finance"
                    ? "Finance"
                    : user.role || "-"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">
            Data tidak ditemukan
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
