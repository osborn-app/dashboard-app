"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Minus, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AkunItem {
  id: string;
  code: string;
  name: string;
  type: 'parent' | 'child' | 'account';
  children?: AkunItem[];
  level?: number;
  isExpanded?: boolean;
}

interface AkunColumnsProps {
  onToggleExpand?: (id: string) => void;
  onEdit?: (item: AkunItem) => void;
  onDelete?: (item: AkunItem) => void;
  onView?: (item: AkunItem) => void;
}

export const createAkunColumns = ({
  onToggleExpand,
  onEdit,
  onDelete,
  onView,
}: AkunColumnsProps): ColumnDef<AkunItem>[] => [
  {
    accessorKey: "code",
    header: "Kode Akun",
    cell: ({ row }) => {
      const item = row.original;
      const hasChildren = item.children && item.children.length > 0;
      const level = item.level || 0;
      
      return (
        <div className="flex items-center gap-3" style={{ marginLeft: `${level * 20}px` }}>
          {hasChildren && onToggleExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(item.id)}
              className="h-6 w-6 p-0"
            >
              {item.isExpanded ? (
                <Minus className="h-4 w-4 text-blue-500" />
              ) : (
                <Plus className="h-4 w-4 text-blue-500" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <span className={`font-medium ${
            item.type === 'parent' ? 'text-blue-600' : 
            item.type === 'child' ? 'text-blue-500' : 
            'text-gray-700'
          }`}>
            {item.code}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nama Akun",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <span className={`font-medium ${
          item.type === 'parent' ? 'text-blue-600' : 
          item.type === 'child' ? 'text-blue-500' : 
          'text-gray-700'
        }`}>
          {item.name}
        </span>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      
      const getTypeLabel = (type: string) => {
        switch (type) {
          case "parent":
            return "Parent";
          case "child":
            return "Child";
          case "account":
            return "Account";
          default:
            return type;
        }
      };

      return (
        <span className="text-sm text-gray-600">
          {getTypeLabel(type)}
        </span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(item)}>
                Lihat Detail
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(item)}>
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(item)}
                  className="text-red-600"
                >
                  Hapus
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
