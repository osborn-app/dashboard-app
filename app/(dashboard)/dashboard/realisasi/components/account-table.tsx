"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Filter, Download, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountTableItem {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
  status: 'active' | 'inactive' | 'pending';
  lastUpdated: string;
  bankNumber?: string;
}

interface AccountTableProps {
  accounts: AccountTableItem[];
  onAddAccount?: () => void;
  onEditAccount?: (id: string) => void;
  onDeleteAccount?: (id: string) => void;
}

export default function AccountTable({ 
  accounts, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount 
}: AccountTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.code.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onAddAccount} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Rekening
          </Button>
        </div>
      </div>

      {/* Account Cards - Simple Layout */}
      <div className="space-y-3">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada rekening yang ditemukan
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Left Section - Account Info */}
                  <div className="flex items-center space-x-4">
                    {/* Avatar/Icon Placeholder */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-sm font-medium">
                        {account.name.charAt(0)}
                      </span>
                    </div>
                    
                    {/* Account Details */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 uppercase">
                        {account.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {account.type} - {account.code}
                      </p>
                    </div>
                  </div>

                  {/* Right Section - Amount */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(account.balance)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(account.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditAccount?.(account.id)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteAccount?.(account.id)}>
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
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

      {/* Results Count */}
      <div className="text-sm text-gray-500 text-center">
        {filteredAccounts.length} dari {accounts.length} rekening
      </div>
    </div>
  );
}
