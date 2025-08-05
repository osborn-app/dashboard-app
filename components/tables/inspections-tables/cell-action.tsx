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
import { MoreHorizontal, Eye, Play } from "lucide-react";
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

  const getActions = () => {
    switch (status) {
      case "active":
        return [
          {
            label: "Mulai Inspeksi",
            icon: Play,
            onClick: handleStartInspection,
          },
        ];
      case "pending_repair":
      case "completed":
        return [
          {
            label: "Preview",
            icon: Eye,
            onClick: handlePreview,
          },
        ];
      default:
        return [];
    }
  };

  const actions = getActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            className="cursor-pointer"
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
