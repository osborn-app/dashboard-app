"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronRight, Minus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AccountItem {
  id: string;
  code: string;
  name: string;
  type: string;
  level: number;
  expanded: boolean;
  children: AccountItem[];
}

interface AccountListProps {
  accounts: AccountItem[];
  onReorder?: (newOrder: AccountItem[]) => void;
  onEditAccount?: (id: string) => void;
  onDeleteAccount?: (id: string) => void;
}

// Sortable Account Item Component
function SortableAccountItem({ 
  account, 
  level = 0, 
  onToggleExpansion,
  onEditAccount,
  onDeleteAccount
}: { 
  account: AccountItem; 
  level?: number;
  onToggleExpansion: (id: string) => void;
  onEditAccount?: (id: string) => void;
  onDeleteAccount?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });

  const hasChildren = account.children && account.children.length > 0;
  const isExpanded = account.expanded;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
          "hover:bg-gray-50 cursor-pointer",
          level === 0 ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200",
          level === 1 ? "ml-6" : level === 2 ? "ml-12" : level === 3 ? "ml-18" : ""
        )}
      >
        <div className="flex items-center space-x-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => onToggleExpansion(account.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <Minus className="h-4 w-4 text-blue-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs font-mono">
              {account.code}
            </Badge>
            <span className="font-medium text-gray-900">
              {account.name}
            </span>
            <span className="text-sm text-gray-500">
              ({account.type})
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditAccount?.(account.id)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteAccount?.(account.id)}>Delete</DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-6">
          {account.children.map((child) => (
            <SortableAccountItem
              key={child.id}
              account={child}
              level={level + 1}
              onToggleExpansion={onToggleExpansion}
              onEditAccount={onEditAccount}
              onDeleteAccount={onDeleteAccount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountList({ accounts, onReorder, onEditAccount, onDeleteAccount }: AccountListProps) {
  const [localAccounts, setLocalAccounts] = useState<AccountItem[]>(accounts);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set(accounts.filter(acc => acc.expanded).map(acc => acc.id))
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localAccounts.findIndex((item) => item.id === active.id);
    const newIndex = localAccounts.findIndex((item) => item.id === over.id);

    const newOrder = arrayMove(localAccounts, oldIndex, newIndex);
    setLocalAccounts(newOrder);

    // Call the onReorder callback if provided
    if (onReorder) {
      try {
        await onReorder(newOrder);
        console.log("Order updated successfully");
      } catch (error) {
        console.error("Failed to update order:", error);
        // Revert changes on error
        setLocalAccounts(accounts);
      }
    }
  };

  // Handle expansion toggle
  const handleToggleExpansion = (accountId: string) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  // Flatten accounts for sorting (only top level items)
  const topLevelAccounts = localAccounts.map(account => ({
    ...account,
    expanded: expandedAccounts.has(account.id)
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={topLevelAccounts.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {topLevelAccounts.map((account) => (
            <SortableAccountItem
              key={account.id}
              account={account}
              onToggleExpansion={handleToggleExpansion}
              onEditAccount={onEditAccount}
              onDeleteAccount={onDeleteAccount}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
