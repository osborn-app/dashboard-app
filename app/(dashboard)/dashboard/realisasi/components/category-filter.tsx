"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionCategory } from "../types";
import { Input } from "@/components/ui/input";

interface CategoryFilterProps {
  categories: TransactionCategory[];
  selectedCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  placeholder?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
  placeholder = "Pilih Kategori"
}: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedCategory = categories.find(
    (category) => category.id.toString() === selectedCategoryId
  );

  // Filter categories based on search value
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (categoryId: string) => {
    onCategoryChange?.(categoryId === selectedCategoryId ? "all" : categoryId);
    setOpen(false);
  };

  const handleClear = () => {
    onCategoryChange?.("all");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue(""); // Reset search when closing
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-w-[200px]"
        >
          <div className="flex items-center gap-2">
            {selectedCategory ? (
              <Badge variant="secondary" className="text-xs font-semibold text-gray-900 bg-gray-200 hover:bg-gray-300">
                {selectedCategory.name}
              </Badge>
            ) : (
              <span className="text-gray-600 font-medium">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedCategory && (
              <X
                className="ml-1 h-4 w-4 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 z-50">
        <div className="border rounded-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Cari kategori..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                {searchValue ? "Kategori tidak ditemukan." : "Tidak ada kategori."}
              </div>
            ) : (
              <div className="p-1">
                {/* Semua Kategori Option */}
                <div
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded-sm flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect("all");
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCategoryId === "all" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    Semua Kategori
                  </span>
                </div>
                
                {/* Category Options */}
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded-sm flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(category.id.toString());
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategoryId === category.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
