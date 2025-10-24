"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface CellActionProps {
  data: any; // Driver shift data
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();

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

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/driver-shift/${data?.id}/edit`);
          }}
        >
          <Edit className="mr-2 h-4 w-4" /> Update
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
