"use client";

import React from "react";
import TransactionList from "./transactions";
import { Account, TransactionCategory } from "../types";

// Example parent component showing how to use the updated TransactionList
export default function TransactionsExample() {
  // Mock data for accounts and categories
  const accounts: Account[] = [
    { id: 1, code: "1110", name: "Kas & Bank", type: "ASSETS", level: 2, is_header: false },
    { id: 2, code: "4110", name: "Pendapatan Sewa", type: "REVENUE", level: 2, is_header: false },
  ];

  const categories: TransactionCategory[] = [
    { id: 1, name: "Pendapatan Sewa", description: "Kategori untuk pendapatan sewa", is_active: true },
    { id: 2, name: "Biaya Operasional", description: "Kategori untuk biaya operasional", is_active: true },
  ];

  const handleCreateTransaction = (transactionData: any) => {
    console.log("Create transaction:", transactionData);
    // Implement create transaction logic
  };

  const handleDeleteTransaction = (id: number) => {
    console.log("Delete transaction:", id);
    // Implement delete transaction logic
  };

  const handleSyncAll = () => {
    console.log("Sync all data");
    // Implement sync all logic
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Financial Transactions</h1>
      
      <TransactionList
        accounts={accounts}
        categories={categories}
        onCreateTransaction={handleCreateTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onSyncAll={handleSyncAll}
      />
    </div>
  );
}

// Example showing the API payload structure
export const API_PAYLOAD_EXAMPLE = {
  page: 1,
  limit: 50,
  search: "pendapatan", // optional
  startDate: "2024-01-01", // optional
  endDate: "2024-12-31", // optional
  accountCode: "1110", // optional
  categoryId: "1", // optional
};

// Example API response structure
export const API_RESPONSE_EXAMPLE = {
  data: [
    {
      id: 1,
      description: "Pendapatan Sewa Kendaraan",
      transaction_date: "2024-01-15",
      category_id: 1,
      total_amount: 5000000,
      notes: "Pendapatan dari sewa kendaraan bulan Januari",
      entries: [
        {
          id: 1,
          account: { id: 1, code: "1110", name: "Kas & Bank" },
          amount: 5000000,
          entry_type: "DEBIT"
        },
        {
          id: 2,
          account: { id: 2, code: "4110", name: "Pendapatan Sewa" },
          amount: 5000000,
          entry_type: "CREDIT"
        }
      ],
      category: { id: 1, name: "Pendapatan Sewa" }
    }
  ],
  total: 150,
  page: 1,
  limit: 50,
  totalPages: 3,
  hasNextPage: true,
  hasPrevPage: false
};
