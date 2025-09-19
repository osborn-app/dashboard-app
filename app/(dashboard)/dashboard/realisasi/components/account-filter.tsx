"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account } from "../types";

interface AccountFilterProps {
  accounts: Account[];
  selectedAccountId: number | null;
  onAccountSelect: (accountId: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function AccountFilter({
  accounts,
  selectedAccountId,
  onAccountSelect,
  placeholder = "Pilih akun...",
  disabled = false,
}: AccountFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedAccount = accounts.find(account => account.id === selectedAccountId);

  // Filter accounts based on search value
  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    account.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAccountSelect = (accountId: number | null) => {
    onAccountSelect(accountId);
    setOpen(false);
    setSearchValue("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-medium cursor-pointer hover:bg-gray-50"
          disabled={disabled}
        >
          {selectedAccount ? (
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">
                {selectedAccount.code} - {selectedAccount.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-gray-200 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccountSelect(null);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-50">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Cari akun..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
            />
          </div>
          <CommandList className="max-h-[200px]">
            <CommandEmpty>
              {searchValue ? "Akun tidak ditemukan." : "Tidak ada akun tersedia."}
            </CommandEmpty>
            <CommandGroup>
              {filteredAccounts.map((account) => (
                <CommandItem
                  key={account.id}
                  value={`${account.code} ${account.name}`}
                  onSelect={() => handleAccountSelect(account.id)}
                  className="cursor-pointer relative"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedAccountId === account.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    {account.code} - {account.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
