"use client";

import React, { useState, useEffect } from "react";
import BankAccountsTable from "../bank-accounts-table";
import { AccountTableSkeleton, FadeInWrapper } from "../ui/skeleton-loading";
import {
  useGetBankAccountsWithBalance
} from "@/hooks/api/useRealization";
import { TabType } from "../../hooks/use-tab-state";
import { useDebounce } from "../../hooks/use-debounce";

interface DaftarRekeningTabProps {
  registerRefetchCallback: (tab: TabType, callback: () => void) => void;
}

export default function DaftarRekeningTab({ registerRefetchCallback }: DaftarRekeningTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
  
  // API Hooks
  const { data: bankAccountsData, isLoading: bankAccountsLoading, refetch: refetchBankAccounts } = useGetBankAccountsWithBalance({
    ...(debouncedSearchQuery && { q: debouncedSearchQuery })
  });

  // Register refetch callback for this tab
  useEffect(() => {
    registerRefetchCallback("daftar-rekening", refetchBankAccounts);
  }, [registerRefetchCallback, refetchBankAccounts]);

  return (
    <div className="space-y-4">
      {bankAccountsLoading ? (
        <FadeInWrapper>
          <AccountTableSkeleton />
        </FadeInWrapper>
      ) : (
        <FadeInWrapper delay={200}>
          <BankAccountsTable
            accounts={bankAccountsData?.data || []}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </FadeInWrapper>
      )}
    </div>
  );
}
