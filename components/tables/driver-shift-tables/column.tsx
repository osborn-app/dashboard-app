"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { dummyJenisShift, dummyCabang, dummyJamShift } from "@/app/(dashboard)/dashboard/driver-shift/dummy-data";
import { DriverShift } from "@/app/(dashboard)/dashboard/driver-shift/dummy-data";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ColumnProps {
  isEditMode: boolean;
  onUpdateShift: (id: string, field: keyof DriverShift, value: string) => void;
  onDeleteShift: (id: string) => void;
}

// Cell Action Component
const CellAction: React.FC<{ data: DriverShift; onDelete: (id: string) => void }> = ({ data, onDelete }) => {
  const handleDelete = () => {
    onDelete(data.id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Shift Driver</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus shift untuk driver{" "}
            <span className="font-semibold">{data.namaDriver}</span>?
            <br />
            <span className="text-sm text-muted-foreground">
              Shift: {data.jenisShift} - {data.cabang}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const createDriverShiftColumns = ({ isEditMode, onUpdateShift, onDeleteShift }: ColumnProps): ColumnDef<DriverShift>[] => {
  const baseColumns: ColumnDef<DriverShift>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "namaDriver",
      header: "Nama Driver",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.namaDriver}</span>
      ),
    },
    {
      accessorKey: "jenisShift",
      header: "Jenis Shift",
      cell: ({ row }) => {
        if (isEditMode) {
          return (
            <Select
              value={row.original.jenisShift}
              onValueChange={(value) => {
                onUpdateShift(row.original.id, 'jenisShift', value);
                // Auto update jam based on shift type
                const jamData = dummyJamShift[value as keyof typeof dummyJamShift];
                if (jamData) {
                  onUpdateShift(row.original.id, 'jamMulai', jamData.mulai);
                  onUpdateShift(row.original.id, 'jamSelesai', jamData.selesai);
                }
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dummyJenisShift.map((shift) => (
                  <SelectItem key={shift} value={shift}>
                    {shift}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return <span>{row.original.jenisShift}</span>;
      },
    },
    {
      accessorKey: "jamMulai",
      header: "Jam Mulai",
      cell: ({ row }) => {
        if (isEditMode) {
          return (
            <Input
              type="time"
              value={row.original.jamMulai}
              onChange={(e) => onUpdateShift(row.original.id, 'jamMulai', e.target.value)}
              className="w-[100px]"
              disabled={row.original.jenisShift === 'Libur'}
            />
          );
        }
        return <span>{row.original.jamMulai}</span>;
      },
    },
    {
      accessorKey: "jamSelesai",
      header: "Jam Selesai",
      cell: ({ row }) => {
        if (isEditMode) {
          return (
            <Input
              type="time"
              value={row.original.jamSelesai}
              onChange={(e) => onUpdateShift(row.original.id, 'jamSelesai', e.target.value)}
              className="w-[100px]"
              disabled={row.original.jenisShift === 'Libur'}
            />
          );
        }
        return <span>{row.original.jamSelesai}</span>;
      },
    },
    {
      accessorKey: "cabang",
      header: "Cabang",
      cell: ({ row }) => {
        if (isEditMode) {
          return (
            <Select
              value={row.original.cabang}
              onValueChange={(value) => onUpdateShift(row.original.id, 'cabang', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dummyCabang.map((cabang) => (
                  <SelectItem key={cabang} value={cabang}>
                    {cabang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return <span>{row.original.cabang}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors = {
          active: "bg-green-100 text-green-800",
          completed: "bg-blue-100 text-blue-800",
          cancelled: "bg-red-100 text-red-800",
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {status === 'active' ? 'Aktif' : status === 'completed' ? 'Selesai' : 'Dibatalkan'}
          </span>
        );
      },
    },
  ];

  // Tambahkan kolom aksi jika dalam mode edit
  if (isEditMode) {
    baseColumns.push({
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => <CellAction data={row.original} onDelete={onDeleteShift} />,
    });
  }

  return baseColumns;
};