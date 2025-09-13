"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Filter, Download, Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionItem {
  id: string;
  reference: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface TransactionListProps {
  transactions: TransactionItem[];
  onAddTransaction?: () => void;
  onEditTransaction?: (id: string) => void;
  onDeleteTransaction?: (id: string) => void;
}

export default function TransactionList({ 
  transactions, 
  onAddTransaction, 
  onEditTransaction, 
  onDeleteTransaction 
}: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'income':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pemasukan</Badge>;
      case 'expense':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Pengeluaran</Badge>;
      case 'transfer':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Transfer</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Dibatalkan</Badge>;
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

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pemasukan</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo Netto</p>
                <p className={cn("text-2xl font-bold", netAmount >= 0 ? "text-green-600" : "text-red-600")}>
                  {formatCurrency(netAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Daftar Transaksi</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={onAddTransaction} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari transaksi....."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Tipe</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
                <option value="transfer">Transfer</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="completed">Selesai</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredTransactions.length} dari {transactions.length} transaksi
            </div>
          </div>

          {/* Transaction Cards */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada transaksi yang ditemukan
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getTypeIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                            {getTypeBadge(transaction.type)}
                            {getStatusBadge(transaction.status)}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Ref: {transaction.reference}</span>
                            <span>Kategori: {transaction.category}</span>
                            <span>Rekening: {transaction.account}</span>
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={cn(
                            "text-lg font-semibold",
                            transaction.type === 'income' ? "text-green-600" : 
                            transaction.type === 'expense' ? "text-red-600" : "text-blue-600"
                          )}>
                            {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditTransaction?.(transaction.id)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}