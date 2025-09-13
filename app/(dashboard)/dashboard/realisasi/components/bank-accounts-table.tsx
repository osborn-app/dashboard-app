"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Filter, Download, Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account } from "../types";

interface BankAccount {
  id: number;
  code: string;
  name: string;
  type: string;
  level: number;
  is_active: boolean;
  sort_order: number;
  is_header: boolean;
  is_connected_to_bank: boolean;
  bank_name: string | null;
  bank_account_number: string | null;
  initial_balance: number;
  realTimeBalance?: number; // Saldo real-time berdasarkan transaksi
  parent_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface BankAccountsTableProps {
  accounts: BankAccount[];
  onAddAccount?: () => void;
  onEditAccount?: (id: number) => void;
  onDeleteAccount?: (id: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function BankAccountsTable({ 
  accounts, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount,
  searchQuery = "",
  onSearchChange
}: BankAccountsTableProps) {
  // Use API search instead of local filtering
  const filteredAccounts = accounts;

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari rekening....."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Bank Account Cards */}
      <div className="space-y-3">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada rekening yang ditemukan
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Left Section - Account Info */}
                  <div className="flex items-center space-x-4">
                    {/* Bank Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">
                        {account.bank_name ? account.bank_name.charAt(0).toUpperCase() : 'B'}
                      </span>
                    </div>
                    
                    {/* Account Details */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900">
                        {account.bank_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        BANK - {account.bank_account_number}
                      </p>
                      {/* {account.bank_name && (
                        <p className="text-sm text-blue-600 font-medium">
                          {account.name}
                        </p>
                      )}
                      {account.bank_account_number && (
                        <p className="text-xs text-gray-500">
                          No. Rek: {account.code} - {account.type}
                        </p>
                      )} */}
                    </div>
                  </div>

                  {/* Right Section - Balance and Actions */}
                  <div className="flex items-center space-x-4">
                    {/* Balance */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(account.realTimeBalance ?? account.initial_balance)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {account.realTimeBalance !== undefined ? 'Saldo Real-time' : 'Saldo Awal'}
                      </p>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center space-x-2">
                      {/* {getStatusBadge(account.is_active)} */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditAccount?.(account.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteAccount?.(account.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredAccounts.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total {filteredAccounts.length} rekening
              </div>
              <div className="text-sm font-medium text-gray-900">
                Total Saldo Real-time: {formatCurrency(
                  filteredAccounts.reduce((sum, account) => 
                    sum + (account.realTimeBalance ?? account.initial_balance), 0
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
