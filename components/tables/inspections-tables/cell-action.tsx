"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

  // Untuk status "active" (tersedia), tampilkan button "Mulai Inspeksi"
  if (status === "active") {
    return (
      <Button
        onClick={handleStartInspection}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        <Play className="mr-2 h-4 w-4" />
        Mulai Inspeksi
      </Button>
    );
  }

  // Untuk status "pending_repair" (ongoing), tampilkan button "Tinjau"
  if (status === "pending_repair") {
    return (
      <Button
        onClick={handlePreview}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        <Search className="mr-2 h-4 w-4" />
        Tinjau
      </Button>
    );
  }

  // Untuk status "completed" (selesai), tampilkan button "Detail"
  if (status === "completed") {
    return (
      <Button
        onClick={handlePreview}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        <Eye className="mr-2 h-4 w-4" />
        Detail
      </Button>
    );
  }
};
