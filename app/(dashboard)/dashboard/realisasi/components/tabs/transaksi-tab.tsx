"use client";

import React from "react";
import TransactionList from "../transactions";

interface TransaksiTabProps {
  transactionData: any[];
  onAddTransaction: () => void;
  onEditTransaction: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function TransaksiTab({
  transactionData,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction
}: TransaksiTabProps) {
  return (
    <div className="space-y-4">
      <TransactionList 
        transactions={transactionData}
        onAddTransaction={onAddTransaction}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
      />
    </div>
  );
}
