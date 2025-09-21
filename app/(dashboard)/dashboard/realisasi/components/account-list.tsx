"use client";

import React, { useState, useRef, useEffect } from "react";
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

import { Account, ReorderAccountsData } from "../types";

interface AccountItem extends Account {
  expanded: boolean;
  children: AccountItem[];
}

interface AccountListProps {
  accounts: AccountItem[];
  onReorder?: (newOrder: ReorderAccountsData) => void;
  onEditAccount?: (id: number) => void;
  onDeleteAccount?: (id: number) => void;
}

// Animated Collapse Component
function AnimatedCollapse({ 
  isOpen, 
  children 
}: { 
  isOpen: boolean; 
  children: React.ReactNode 
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>(isOpen ? 'auto' : '0px');

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      if (isOpen) {
        setHeight(`${scrollHeight}px`);
        // Reset to auto after animation completes
        setTimeout(() => setHeight('auto'), 300);
      } else {
        setHeight(`${scrollHeight}px`);
        // Force reflow
        contentRef.current.offsetHeight;
        setHeight('0px');
      }
    }
  }, [isOpen]);

  return (
    <div
      ref={contentRef}
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ height }}
    >
      {children}
    </div>
  );
}

// Non-sortable Account Item Component (for children)
function AccountItem({ 
  account, 
  level = 0, 
  onToggleExpansion,
  onEditAccount,
  onDeleteAccount
}: { 
  account: AccountItem; 
  level?: number;
  onToggleExpansion: (id: number) => void;
  onEditAccount?: (id: number) => void;
  onDeleteAccount?: (id: number) => void;
}) {
  const hasChildren = account.children && account.children.length > 0;
  const isExpanded = account.expanded;

  return (
    <div className="mb-2">
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
          "hover:bg-gray-50 cursor-pointer",
          level === 0 ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200",
          level === 1 ? "ml-6" : level === 2 ? "ml-12" : level === 3 ? "ml-18" : ""
        )}
      >
        <div className="flex items-center space-x-3">
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => onToggleExpansion(account.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <div className={cn(
                "transition-transform duration-300 ease-in-out",
                isExpanded ? "rotate-90" : "rotate-0"
              )}>
                {isExpanded ? (
                  <Minus className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                )}
              </div>
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

      {hasChildren && (
        <AnimatedCollapse isOpen={isExpanded}>
          <div className="ml-6 pt-2">
            {account.children.map((child) => (
              <AccountItem
                key={child.id}
                account={child}
                level={level + 1}
                onToggleExpansion={onToggleExpansion}
                onEditAccount={onEditAccount}
                onDeleteAccount={onDeleteAccount}
              />
            ))}
          </div>
        </AnimatedCollapse>
      )}
    </div>
  );
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
  onToggleExpansion: (id: number) => void;
  onEditAccount?: (id: number) => void;
  onDeleteAccount?: (id: number) => void;
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
              <div className={cn(
                "transition-transform duration-300 ease-in-out",
                isExpanded ? "rotate-90" : "rotate-0"
              )}>
                {isExpanded ? (
                  <Minus className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                )}
              </div>
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

      {hasChildren && (
        <AnimatedCollapse isOpen={isExpanded}>
          <div className="ml-6 pt-2">
            {account.children.map((child) => (
              <AccountItem
                key={child.id}
                account={child}
                level={level + 1}
                onToggleExpansion={onToggleExpansion}
                onEditAccount={onEditAccount}
                onDeleteAccount={onDeleteAccount}
              />
            ))}
          </div>
        </AnimatedCollapse>
      )}
    </div>
  );
}

export default function AccountList({ accounts, onReorder, onEditAccount, onDeleteAccount }: AccountListProps) {
  const [localAccounts, setLocalAccounts] = useState<AccountItem[]>(accounts);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(
    new Set(accounts.filter(acc => acc.expanded).map(acc => acc.id))
  );

  // Update local state when accounts prop changes
  React.useEffect(() => {
    setLocalAccounts(accounts);
    setExpandedAccounts(new Set(accounts.filter(acc => acc.expanded).map(acc => acc.id)));
  }, [accounts]);

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
        const reorderData: ReorderAccountsData = {
          accounts: newOrder.map((account, index) => ({
            id: account.id,
            sort_order: index
          }))
        };
        await onReorder(reorderData);
        console.log("Order updated successfully");
      } catch (error) {
        console.error("Failed to update order:", error);
        // Revert changes on error
        setLocalAccounts(accounts);
      }
    }
  };

  // Handle expansion toggle
  const handleToggleExpansion = (accountId: number) => {
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
