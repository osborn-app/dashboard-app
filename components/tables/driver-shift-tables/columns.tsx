"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Function to get shift label based on backend enum
const getShiftLabel = (shiftType: string): string => {
  const labels: Record<string, string> = {
    'libur': 'Libur',
    'shift_pagi': 'Shift Pagi',
    'shift_middle': 'Shift Middle',
    'shift_sore': 'Shift Sore',
    'full_shift': 'Full Shift',
  };
  return labels[shiftType] || shiftType;
};

// Function to get default time based on shift type
const getDefaultShiftTime = (shiftType: string): { start: string; end: string } => {
  const defaultTimes: Record<string, { start: string; end: string }> = {
    'libur': { start: '00:00', end: '00:00' },
    'shift_pagi': { start: '07:00', end: '15:00' },
    'shift_middle': { start: '11:00', end: '19:00' },
    'shift_sore': { start: '15:00', end: '23:00' },
    'full_shift': { start: '07:00', end: '23:00' },
  };
  return defaultTimes[shiftType] || { start: '07:00', end: '15:00' };
};

// Function to generate columns with edit mode support
export const getDriverShiftColumns = (
  isEditMode: boolean,
  onDataChange: (rowId: number, field: string, value: string) => void,
  editingData: Record<number, any> = {},
  locations: Array<{id: number, name: string}> = [],
  shiftTypes: string[] = ["shift_pagi", "shift_middle", "shift_sore", "full_shift", "libur"],
  onShiftTypeChange?: (rowId: number, shiftType: string) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "nama_driver",
    header: "Nama driver",
    cell: ({ row }) => <span>{row.original.name ?? "-"}</span>,
  },
  {
    accessorKey: "jenis_shift",
    header: "Jenis Shift",
    cell: ({ row }) => {
      if (isEditMode) {
        const currentValue = editingData[row.original.id]?.shift_type ?? row.original.shifts?.[0]?.shift_type ?? "";
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => {
              onDataChange(row.original.id, "shift_type", value);
              if (onShiftTypeChange) {
                onShiftTypeChange(row.original.id, value);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih shift" />
            </SelectTrigger>
            <SelectContent>
              {shiftTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {getShiftLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return <span>{getShiftLabel(row.original.shifts?.[0]?.shift_type) ?? "-"}</span>;
    },
  },
  {
    accessorKey: "jam mulai",
    header: "jam mulai",
    cell: ({ row }) => {
      if (isEditMode) {
        const currentValue = editingData[row.original.id]?.custom_start_time ?? row.original.shifts?.[0]?.custom_start_time ?? "";
        return (
          <Input
            type="time"
            value={currentValue}
            onChange={(e) => onDataChange(row.original.id, "custom_start_time", e.target.value)}
            className="w-[120px]"
          />
        );
      }
      return <span>{row.original.shifts?.[0]?.custom_start_time ?? "-"}</span>;
    }
  },
  {
    accessorKey: "jam selesai",
    header: "jam selesai",
    cell: ({ row }) => {
      if (isEditMode) {
        const currentValue = editingData[row.original.id]?.custom_end_time ?? row.original.shifts?.[0]?.custom_end_time ?? "";
        return (
          <Input
            type="time"
            value={currentValue}
            onChange={(e) => onDataChange(row.original.id, "custom_end_time", e.target.value)}
            className="w-[120px]"
          />
        );
      }
      return <span>{row.original.shifts?.[0]?.custom_end_time ?? "-"}</span>;
    }
  },
  {
    accessorKey: "cabang",
    header: "cabang",
    cell: ({ row }) => {
      if (isEditMode) {
        const currentValue = editingData[row.original.id]?.location_id ?? row.original.shifts?.[0]?.location_id ?? "";
        
        return (
          <Select
            value={currentValue?.toString() ?? ""}
            onValueChange={(value) => onDataChange(row.original.id, "location_id", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih cabang" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(locations) && locations.length > 0 ? (
                locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  Tidak ada lokasi tersedia
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        );
      }
      return <span>{row.original.shifts?.[0]?.location?.name ?? "-"}</span>;
    }
  },
];

// Default columns for non-edit mode
export const columnsDriverShift: ColumnDef<any>[] = getDriverShiftColumns(false, () => {});

export const columnsDriverReports: ColumnDef<any>[] = [
  {
    accessorKey: "nama_driver",
    header: "Nama driver",
    cell: ({ row }) => <span>{row.original.driver_name ?? "-"}</span>,
  },
  {
    accessorKey: "pengantaran",
    header: "Pengantaran",
    cell: ({ row }) => <span>{row.original.total_pengantaran ?? "-"}</span>,
  },
  {
    accessorKey: "penjemputan",
    header: "Penjemputan",
    cell: ({ row }) => <span>{row.original.total_penjemputan ?? "-"}</span>,
  },
  {
    accessorKey: "task_diluar_jam_kerja",
    header: "task diluar jam kerja",
    cell: ({ row }) => <span>{row.original.total_luar_jam_kerja ?? "-"}</span>,
  },
]