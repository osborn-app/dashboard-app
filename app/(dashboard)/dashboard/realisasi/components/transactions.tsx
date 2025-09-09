"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, TrendingUp, Edit, Trash2 } from "lucide-react";
import EditTransactionModal from "./transaksi/edit-transaction-modal";
import CreateTransactionModal from "./transaksi/create-transaction-modal";

interface TransactionItem {
  id: string;
  date: string;
  category: string;
  transactionName: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  type: 'debit' | 'credit';
  parentTransactionId?: string;
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transactionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery);
    const matchesAccount = accountFilter === "all" || transaction.accountCode === accountFilter;
    const matchesStatus = statusFilter === "all" || transaction.type === statusFilter;
    
    // Date filtering
    let matchesDate = true;
    if (startDate && endDate) {
      const transactionDate = new Date(transaction.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matchesDate = transactionDate >= start && transactionDate <= end;
    }
    
    return matchesSearch && matchesAccount && matchesStatus && matchesDate;
  });

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
      month: 'long',
      day: 'numeric',
    });
  };

  // Group transactions by parent transaction ID for double-entry display
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const key = transaction.parentTransactionId || transaction.id;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(transaction);
    return groups;
  }, {} as Record<string, TransactionItem[]>);

  const handleEditClick = (transaction: TransactionItem) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditTransaction = (id: string, data: Partial<TransactionItem>) => {
    if (onEditTransaction) {
      onEditTransaction(id);
    }
  };

  const handleCreateTransaction = (data: any) => {
    if (onAddTransaction) {
      onAddTransaction();
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (onDeleteTransaction) {
      onDeleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari Transaksi"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Date Range Filters */}
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
              placeholder="Tanggal Mulai"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
              placeholder="Tanggal Selesai"
            />
          </div>
          
          {/* Account and Status Filters */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Daftar Akun</option>
            <option value="11100">11100 - KAS & BANK</option>
            <option value="41000">41000 - Pendapatan Sewa Kendaraan</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Daftar Status</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Rekap Transaksi
          </Button>
          <Button onClick={handleCreateClick} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tanggal Transaksi</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Kategori</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Transaksi</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Akun</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Debit</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Kredit</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(groupedTransactions).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Tidak ada transaksi yang ditemukan
                    </td>
                  </tr>
                ) : (
                  Object.values(groupedTransactions).map((group, groupIndex) => {
                    const firstTransaction = group[0];
                    const debitTransaction = group.find(t => t.debit > 0);
                    const creditTransaction = group.find(t => t.credit > 0);
                    
                    return (
                      <React.Fragment key={firstTransaction.id}>
                        {/* Debit Row */}
                        {debitTransaction && (
                          <tr className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">
                              {formatDate(firstTransaction.date)}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {firstTransaction.category}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {firstTransaction.transactionName}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              <span className="font-mono text-sm text-gray-600">{debitTransaction.accountCode}</span>
                              <span className="ml-2">{debitTransaction.accountName}</span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-gray-900">
                              {formatCurrency(debitTransaction.debit)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-gray-900">
                              {/* Empty for debit row */}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(firstTransaction)}
                                  className="h-8 w-8 p-0 bg-gray-200 hover:bg-gray-300"
                                  title="Edit Transaksi"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTransaction(firstTransaction.id)}
                                  className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600"
                                  title="Hapus Transaksi"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                        
                        {/* Credit Row */}
                        {creditTransaction && (
                          <tr className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">
                              {/* Empty for credit row */}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {/* Empty for credit row */}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {/* Empty for credit row */}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              <span className="font-mono text-sm text-gray-600">{creditTransaction.accountCode}</span>
                              <span className="ml-2">{creditTransaction.accountName}</span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-gray-900">
                              {/* Empty for debit row */}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-gray-900">
                              {formatCurrency(creditTransaction.credit)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {/* Empty for credit row */}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-500 text-center">
        {filteredTransactions.length} dari {transactions.length} transaksi
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={selectedTransaction}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTransaction}
      />
    </div>
  );
}
