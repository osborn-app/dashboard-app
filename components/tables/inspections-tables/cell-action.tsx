"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Play, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Inspection } from "./columns";

interface CellActionProps {
  data: Inspection;
  status: "active" | "pending_repair" | "completed";
}

export const CellAction: React.FC<CellActionProps> = ({ data, status }) => {
  const router = useRouter();

  const handlePreview = () => {
    router.push(`/dashboard/inspections/${data.id}/preview`);
  };

  const handleStartInspection = () => {
    const fleetId = data.fleet?.id;
    if (fleetId) {
      router.push(`/dashboard/inspections/create?fleet_id=${fleetId}`);
    } else {
      router.push(`/dashboard/inspections/create`);
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* Untuk status "active" (tersedia), tampilkan "Mulai Inspeksi" */}
        {status === "active" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleStartInspection();
            }}
          >
            <Play className="mr-2 h-4 w-4" /> Mulai Inspeksi
          </DropdownMenuItem>
        )}

        {/* Untuk status "pending_repair" (ongoing), tampilkan "Tinjau" */}
        {status === "pending_repair" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handlePreview();
            }}
          >
            <Search className="mr-2 h-4 w-4" /> Tinjau
          </DropdownMenuItem>
        )}

        {/* Untuk status "completed" (selesai), tampilkan "Detail" */}
        {status === "completed" && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handlePreview();
            }}
          >
            <Eye className="mr-2 h-4 w-4" /> Detail
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
