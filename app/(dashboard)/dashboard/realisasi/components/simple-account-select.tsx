"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account } from "../types";

interface SimpleAccountSelectProps {
  accounts: Account[];
  selectedAccountId: number | null;
  onAccountSelect: (accountId: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SimpleAccountSelect({
  accounts,
  selectedAccountId,
  onAccountSelect,
  placeholder = "Pilih akun...",
  disabled = false,
}: SimpleAccountSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedAccount = accounts.find(account => account.id === selectedAccountId);

  // Filter accounts based on search value and exclude header accounts
  const filteredAccounts = useMemo(() => {
    // First filter out header accounts
    const nonHeaderAccounts = accounts.filter(account => !account.is_header);
    
    if (!searchValue.trim()) return nonHeaderAccounts;
    
    return nonHeaderAccounts.filter(account =>
      account.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      account.code.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [accounts, searchValue]);

  const handleAccountSelect = (accountId: number | null) => {
    onAccountSelect(accountId);
    setIsOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    onAccountSelect(null);
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between font-medium cursor-pointer hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedAccount ? (
          <div className="flex items-center space-x-2">
            <span className="text-gray-900">
              {selectedAccount.code} - {selectedAccount.name} ({selectedAccount.type})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-gray-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-[100] max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari akun..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 h-8 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredAccounts.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {searchValue ? "Akun tidak ditemukan." : "Tidak ada akun tersedia."}
              </div>
            ) : (
              filteredAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0",
                    selectedAccountId === account.id && "bg-blue-100 text-blue-900"
                  )}
                  onClick={() => handleAccountSelect(account.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {account.code} - {account.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {account.type}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
